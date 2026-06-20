# ---------------------------------------------------------------------------
# S3 bucket — React/Vite build artifacts
# Private; only CloudFront (via OAC) can read objects.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.prefix}-frontend"
  tags   = local.tags
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ---------------------------------------------------------------------------
# CloudFront Origin Access Control — restricts S3 to CloudFront only
# ---------------------------------------------------------------------------

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.prefix}-frontend-oac"
  description                       = "OAC for ${local.prefix} React SPA"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}


# Bucket policy: allow only the CloudFront distribution to GetObject
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      },
    ]
  })
}

# ---------------------------------------------------------------------------
# ACM certificate — production only; must be in us-east-1 for CloudFront
# ---------------------------------------------------------------------------

resource "aws_acm_certificate" "main" {
  count = local.is_prod ? 1 : 0

  domain_name               = local.domain
  subject_alternative_names = ["www.${local.domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.tags
}

# Route 53 hosted zone — already exists from domain registration; data source only
data "aws_route53_zone" "main" {
  count        = local.is_prod ? 1 : 0
  name         = local.domain
  private_zone = false
}

# DNS records for certificate validation.
# for_each keys must be statically known at plan time — before the cert exists,
# domain_validation_options is entirely unknown. We key on the domain names we
# already know (they're our own inputs), and look up the computed record fields
# (name/value/type) from domain_validation_options by matching domain_name.
resource "aws_route53_record" "cert_validation" {
  for_each = local.is_prod ? toset([local.domain, "www.${local.domain}"]) : toset([])

  allow_overwrite = true
  name = tolist([
    for dvo in aws_acm_certificate.main[0].domain_validation_options :
    dvo.resource_record_name if dvo.domain_name == each.key
  ])[0]
  records = [tolist([
    for dvo in aws_acm_certificate.main[0].domain_validation_options :
    dvo.resource_record_value if dvo.domain_name == each.key
  ])[0]]
  type = tolist([
    for dvo in aws_acm_certificate.main[0].domain_validation_options :
    dvo.resource_record_type if dvo.domain_name == each.key
  ])[0]
  ttl     = 60
  zone_id = data.aws_route53_zone.main[0].zone_id
}

resource "aws_acm_certificate_validation" "main" {
  count = local.is_prod ? 1 : 0

  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ---------------------------------------------------------------------------
# CloudFront distribution
#   /*         → S3 (React SPA)
#   /graphql   → API Gateway HTTP API → Lambda
# ---------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "main" { # nosemgrep: terraform.aws.security.aws-cloudfront-insecure-tls.aws-insecure-cloudfront-distribution-tls-version
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  # PriceClass_100 = US/Canada/Europe only — cheapest, still free-tier friendly
  price_class = "PriceClass_100"

  # Production uses the custom domain; dev/qa use the *.cloudfront.net domain
  aliases = local.is_prod ? [local.domain, "www.${local.domain}"] : []

  # Origin 1: S3 (React build)
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # Origin 2: API Gateway HTTP API (GraphQL). API Gateway is publicly reachable
  # and CloudFront proxies the request unchanged — no signing required.
  origin {
    domain_name = "${aws_apigatewayv2_api.graphql.id}.execute-api.${local.region}.amazonaws.com"
    origin_id   = "apigateway-graphql"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default behaviour: serve the SPA from S3
  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # /graphql behaviour: proxy to API Gateway; no caching.
  ordered_cache_behavior {
    path_pattern           = "/graphql"
    target_origin_id       = "apigateway-graphql"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = false

    # Managed-CachingDisabled — never cache API responses.
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    # Managed-AllViewerExceptHostHeader — forwards Authorization, Content-Type,
    # cookies, query strings (everything except Host, which must be the API
    # Gateway hostname so the API resolves the right stage).
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
  }

  # Return index.html for any 403/404 from S3 (SPA client-side routing).
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    cloudfront_default_certificate = !local.is_prod
    acm_certificate_arn            = local.is_prod ? aws_acm_certificate_validation.main[0].certificate_arn : null
    ssl_support_method             = local.is_prod ? "sni-only" : null
    # TLSv1 is the only valid value AWS accepts when cloudfront_default_certificate=true (dev/qa);
    # prod uses TLSv1.2_2021 with its ACM cert. The ternary cannot be avoided here.
    minimum_protocol_version = local.is_prod ? "TLSv1.2_2021" : "TLSv1" # nosemgrep: terraform.aws.security.aws-cloudfront-insecure-tls.aws-insecure-cloudfront-distribution-tls-version
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = local.tags
}

# ---------------------------------------------------------------------------
# Route 53 A records → CloudFront (production only)
# ---------------------------------------------------------------------------

resource "aws_route53_record" "apex" {
  count   = local.is_prod ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = local.domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  count   = local.is_prod ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = "www.${local.domain}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# ---------------------------------------------------------------------------
# Email (ImprovMX forwarding) — production only; domain-level records
# Forwards hello@buildbetteralgorithms.com to the owner's personal inbox.
#
# These records were created manually via CLI before the prod pipeline ran.
# The import blocks below adopt them into Terraform state on the first apply.
# ---------------------------------------------------------------------------

import {
  to = aws_route53_record.mx[0]
  id = "Z06750461TVGL3EDH9KNV_buildbetteralgorithms.com_MX"
}

import {
  to = aws_route53_record.spf[0]
  id = "Z06750461TVGL3EDH9KNV_buildbetteralgorithms.com_TXT"
}

resource "aws_route53_record" "mx" {
  count   = local.is_prod ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = local.domain
  type    = "MX"
  ttl     = 300
  records = [
    "10 mx1.improvmx.com",
    "20 mx2.improvmx.com",
  ]
}

resource "aws_route53_record" "spf" {
  count   = local.is_prod ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = local.domain
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:spf.improvmx.com ~all"]
}
