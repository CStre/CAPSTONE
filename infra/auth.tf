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

  # TOTP MFA optional — users may enroll an authenticator app in account settings.
  # Users without TOTP sign in with email + password only (no MFA challenge).
  # Email OTP MFA requires SES (DEVELOPER sending account) — not used here.
  # No SMS MFA — phone is used for attribute verification only.
  mfa_configuration = "OPTIONAL"
  software_token_mfa_configuration {
    enabled = true
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

  tags = local.tags

  # Force pool recreation so a fresh pool is created with all settings in place
  # (avoids a Cognito constraint: email_mfa_configuration is rejected on an existing pool
  # that only has verified_email in account_recovery_setting).
  lifecycle {
    replace_triggered_by = [terraform_data.cognito_pool_recreate]
  }
}

# Bump the value below (e.g. "v2" → "v3") to force pool recreation on next apply.
resource "terraform_data" "cognito_pool_recreate" {
  input = "v3"
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

  read_attributes  = ["email", "name", "given_name", "family_name", "phone_number"]
  write_attributes = ["email", "name", "given_name", "family_name", "phone_number"]
}
