# Bootstrap — run once per AWS account before any environment is deployed.
#
# Creates three account-level resources that must exist before the main
# Terraform config can initialise:
#   1. S3 bucket for Terraform remote state
#   2. DynamoDB table for Terraform state locking
#   3. GitHub Actions OIDC identity provider
#
# Usage:
#   cd infra/bootstrap
#   terraform init
#   terraform apply
#
# State is stored locally (terraform.tfstate in this directory).
# Commit nothing — the .gitignore excludes *.tfstate.

terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------------------
# Terraform remote state bucket
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "tf_state" {
  bucket = "bba-terraform-state-958941188378"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tf_state" {
  bucket                  = aws_s3_bucket.tf_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ---------------------------------------------------------------------------
# Terraform state lock table
# ---------------------------------------------------------------------------

resource "aws_dynamodb_table" "tf_state_lock" { # nosemgrep: terraform.aws.security.aws-dynamodb-table-unencrypted.aws-dynamodb-table-unencrypted
  name         = "bba-terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  server_side_encryption {
    enabled = true # nosemgrep: terraform.aws.security.aws-dynamodb-table-unencrypted.aws-dynamodb-table-unencrypted
  }

  lifecycle {
    prevent_destroy = true
  }
}

# ---------------------------------------------------------------------------
# Shared Travel photo pool bucket (account-global — one set of photos for ALL
# environments; they are identical, so we never triplicate them). Private; read
# only by CloudFront via OAC. Populated out-of-band by `backend: npm run sync:photos`.
#
# The policy trusts any CloudFront distribution in THIS account (AWS:SourceAccount)
# rather than a specific distribution ARN, so every env's distribution (dev/qa/prod)
# can read it without this bootstrap stack knowing their ARNs.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "photos" {
  # Account-ID suffixed for global S3 uniqueness (same pattern as the state bucket).
  bucket = "bba-photos-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "photos" {
  bucket                  = aws_s3_bucket.photos.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "photos" {
  bucket = aws_s3_bucket.photos.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_policy" "photos" {
  bucket = aws_s3_bucket.photos.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalReadOnly"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.photos.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      },
    ]
  })
}

# ---------------------------------------------------------------------------
# GitHub Actions OIDC identity provider (one per AWS account)
# ---------------------------------------------------------------------------

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]

  # GitHub's current certificate thumbprints (both DigiCert and Baltimore root)
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

output "state_bucket" {
  value = aws_s3_bucket.tf_state.bucket
}

output "state_lock_table" {
  value = aws_dynamodb_table.tf_state_lock.name
}

output "github_oidc_arn" {
  value = aws_iam_openid_connect_provider.github.arn
}

output "photos_bucket" {
  value = aws_s3_bucket.photos.bucket
}
