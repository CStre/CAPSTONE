# Cognito user pool — handles identity, email verification, and TOTP MFA.
# The frontend (Amplify Auth) talks to Cognito directly; no auth endpoints
# in the GraphQL Lambda.

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

  # TOTP MFA — no SMS (avoids SNS sandbox / 10DLC and per-message cost)
  mfa_configuration = "ON"
  software_token_mfa_configuration {
    enabled = true
  }

  # Required attributes collected at sign-up
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

  # Email verification message
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your Building Better Algorithms verification code"
    email_message        = "Your verification code is {####}"
  }

  # Account recovery via verified email only (no SMS)
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = local.tags
}

# App client — public SPA, no client secret
resource "aws_cognito_user_pool_client" "main" {
  name         = "${local.prefix}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  # SRP-only auth (secure remote password) + refresh tokens
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
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
}
