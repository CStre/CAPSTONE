# Cognito user pool — handles identity, email/phone verification, and MFA.
# The frontend (Amplify Auth) talks to Cognito directly; no auth endpoints
# in the GraphQL Lambda.

# IAM role Cognito uses to send SMS via SNS (phone verification + recovery).
resource "aws_iam_role" "cognito_sms" {
  name = "${local.prefix}-cognito-sms"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cognito-idp.amazonaws.com" }
      Action    = "sts:AssumeRole"
      Condition = {
        StringEquals = { "sts:ExternalId" = "${local.prefix}-sms" }
      }
    }]
  })

  tags = local.tags
}

resource "aws_iam_role_policy" "cognito_sms_publish" {
  name = "allow-sns-publish"
  role = aws_iam_role.cognito_sms.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sns:Publish"
      Resource = "*"
    }]
  })
}

# ── SES domain identity ────────────────────────────────────────────────────────
# Created once in dev (like the KMS key). QA and prod reuse the same verified
# domain — the ARN is stable as long as the account and region don't change.

# Route 53 hosted zone — looked up in dev for the SES verification record.
# Prod uses its own copy in frontend.tf; this avoids a duplicate data source.
data "aws_route53_zone" "ses" {
  count        = local.env == "dev" ? 1 : 0
  name         = local.domain
  private_zone = false
}

resource "aws_ses_domain_identity" "main" {
  count  = local.env == "dev" ? 1 : 0
  domain = local.domain
}

resource "aws_route53_record" "ses_verification" {
  count   = local.env == "dev" ? 1 : 0
  zone_id = data.aws_route53_zone.ses[0].zone_id
  name    = "_amazonses.${local.domain}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.main[0].verification_token]
}

# Blocks until AWS confirms the TXT record and marks the domain verified.
# Route 53 propagates in seconds, so this rarely waits long.
resource "aws_ses_domain_identity_verification" "main" {
  count      = local.env == "dev" ? 1 : 0
  domain     = aws_ses_domain_identity.main[0].id
  depends_on = [aws_route53_record.ses_verification]
}

locals {
  # ARN is the same across environments once the domain is verified in dev.
  ses_identity_arn = "arn:aws:ses:${local.region}:${local.account_id}:identity/${local.domain}"
}

# ── Cognito user pool ──────────────────────────────────────────────────────────
resource "aws_cognito_user_pool" "main" {
  name = "${local.prefix}-users"

  # Email is the username
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  username_configuration {
    case_sensitive = false
  }

  # Password policy
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # SES — required for email MFA (Cognito rejects email_mfa_configuration when
  # EmailSendingAccount is COGNITO_DEFAULT).
  email_configuration {
    email_sending_account = "DEVELOPER"
    from_email_address    = "Building Better Algorithms <noreply@${local.domain}>"
    source_arn            = local.ses_identity_arn
  }

  # MFA: TOTP (authenticator app) + email OTP as fallback.
  # Users without TOTP enrolled sign in via email OTP automatically (ALLOW_USER_AUTH).
  # Users with TOTP enrolled see a SELECT_MFA_TYPE challenge offering both options,
  # so they can fall back to email if they lose their authenticator device.
  # No SMS MFA — phone is for attribute verification only.
  mfa_configuration = "OPTIONAL"
  software_token_mfa_configuration {
    enabled = true
  }
  email_mfa_configuration {
    message = "Your Building Better Algorithms sign-in code is {####}"
    subject = "Your Building Better Algorithms sign-in code"
  }

  # SNS/SMS — used only to verify the phone_number attribute at sign-up and when
  # the user changes their phone in account settings. NOT used for SMS MFA.
  sms_configuration {
    external_id    = "${local.prefix}-sms"
    sns_caller_arn = aws_iam_role.cognito_sms.arn
  }
  sms_verification_message = "Your Building Better Algorithms verification code is {####}"

  # Required attributes collected at sign-up.
  # NOTE: changing required attributes forces Terraform to replace the user pool.
  # All test users in DEV/QA will be removed on next apply.
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                = "phone_number"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                = "given_name"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 1
      max_length = 20
    }
  }

  schema {
    name                = "family_name"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 1
      max_length = 20
    }
  }

  # Email verification message
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your Building Better Algorithms verification code"
    email_message        = "Your verification code is {####}"
  }

  # Account recovery: email primary, verified phone secondary
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  # Custom SMS sender — routes all Cognito SMS through the GraphQL Lambda + Pinpoint
  # SMS Voice v2 using the dedicated toll-free origination number.
  # ARN is constructed directly to avoid a Terraform cycle: Lambda env vars reference
  # Cognito IDs, and Cognito lambda_config references the Lambda — using a computed
  # ARN breaks the dependency chain without changing runtime behavior.
  lambda_config {
    custom_sms_sender {
      lambda_arn     = "arn:aws:lambda:${local.region}:${local.account_id}:function:${local.prefix}-graphql"
      lambda_version = "V1_0"
    }
    kms_key_id = local.cognito_sms_key_arn
  }

  tags = local.tags

  # Force pool recreation so a fresh pool is created with all settings in place
  # (avoids a Cognito constraint: email_mfa_configuration is rejected on an existing pool
  # that only has verified_email in account_recovery_setting).
  # In dev, wait for SES domain verification before creating the pool.
  # In QA/prod the domain is already verified (count = 0 → empty dependency list).
  depends_on = [aws_ses_domain_identity_verification.main]

  lifecycle {
    replace_triggered_by = [terraform_data.cognito_pool_recreate]
  }
}

# Bump the value below (e.g. "v4" → "v5") to force pool recreation on next apply.
resource "terraform_data" "cognito_pool_recreate" {
  input = "v5"
}

# KMS key — one shared key across all environments (alias/bba-cognito-sms).
# Created only in dev; qa and prod look it up via the data source below.
# This keeps the cost to $1/month regardless of how many environments exist.
resource "aws_kms_key" "cognito_sms" {
  count                   = var.environment == "dev" ? 1 : 0
  description             = "Cognito custom SMS sender encryption — shared across environments"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "RootFullAccess"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${local.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        Sid       = "CognitoEncrypt"
        Effect    = "Allow"
        Principal = { Service = "cognito-idp.amazonaws.com" }
        Action    = ["kms:GenerateDataKey", "kms:Encrypt"]
        Resource  = "*"
      },
    ]
  })

  lifecycle {
    prevent_destroy = true
  }

  tags = local.tags
}

resource "aws_kms_alias" "cognito_sms" {
  count         = var.environment == "dev" ? 1 : 0
  name          = "alias/bba-cognito-sms"
  target_key_id = aws_kms_key.cognito_sms[0].key_id
}

# All environments resolve the shared key ARN via its fixed alias.
data "aws_kms_alias" "cognito_sms" {
  name       = "alias/bba-cognito-sms"
  depends_on = [aws_kms_alias.cognito_sms]
}

locals {
  cognito_sms_key_arn = data.aws_kms_alias.cognito_sms.target_key_arn
}

# Allow Cognito to invoke the GraphQL Lambda as a custom SMS sender trigger.
resource "aws_lambda_permission" "cognito_custom_sms" {
  statement_id  = "AllowCognitoCustomSMS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.graphql.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}

# App client — public SPA, no client secret
resource "aws_cognito_user_pool_client" "main" {
  name         = "${local.prefix}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  # SRP-only auth + refresh tokens.
  # ALLOW_USER_AUTH enables Cognito to automatically pick TOTP (if enrolled) or
  # email OTP (if not enrolled) — no mid-flow challenge switching needed on the client.
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_AUTH",
  ]

  # Token validity
  access_token_validity  = 1  # hours
  id_token_validity      = 1  # hours
  refresh_token_validity = 30 # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"

  read_attributes  = ["email", "email_verified", "name", "given_name", "family_name", "phone_number", "phone_number_verified"]
  write_attributes = ["email", "name", "given_name", "family_name", "phone_number"]
}
