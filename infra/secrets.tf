# SSM Parameter Store — secrets and config the Lambda reads at startup.
# All parameters are SecureString (AES-256 encryption, free tier).
# Namespace: /bba/<env>/<name>

resource "aws_ssm_parameter" "unsplash_access_key" {
  name        = "/bba/${local.env}/unsplash_access_key"
  description = "Unsplash API client-ID access key for image fetching"
  type        = "SecureString"
  value       = var.unsplash_access_key

  tags = local.tags
}

# Cognito pool ID is also available as a Lambda env var, but storing it in
# SSM lets other tooling read it without going through Terraform outputs.
resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name        = "/bba/${local.env}/cognito_user_pool_id"
  description = "Cognito user pool ID for this environment"
  type        = "String"
  value       = aws_cognito_user_pool.main.id

  tags = local.tags
}

resource "aws_ssm_parameter" "twilio_account_sid" {
  name        = "/bba/${local.env}/twilio_account_sid"
  description = "Twilio Account SID for custom SMS sender"
  type        = "SecureString"
  value       = var.twilio_account_sid
  tags        = local.tags
}

resource "aws_ssm_parameter" "twilio_auth_token" {
  name        = "/bba/${local.env}/twilio_auth_token"
  description = "Twilio Auth Token for custom SMS sender"
  type        = "SecureString"
  value       = var.twilio_auth_token
  tags        = local.tags
}

resource "aws_ssm_parameter" "twilio_from_number" {
  name        = "/bba/${local.env}/twilio_from_number"
  description = "Twilio origination phone number in E.164 format"
  type        = "String"
  value       = var.twilio_from_number
  tags        = local.tags
}

resource "aws_ssm_parameter" "cognito_client_id" {
  name        = "/bba/${local.env}/cognito_client_id"
  description = "Cognito app client ID for this environment"
  type        = "String"
  value       = aws_cognito_user_pool_client.main.id

  tags = local.tags
}
