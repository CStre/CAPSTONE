# DynamoDB table for per-user preference data.
# Cognito owns identity; this table holds only app data.
#
# Schema:
#   PK  userId  (String) — Cognito sub
#   MAP preferences { countryCode -> Number 0-100 } (sparse)
#   STR createdAt (ISO 8601)

resource "aws_dynamodb_table" "prefs" {
  name         = "${local.prefix}-prefs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  # nosemgrep: terraform.aws.security.aws-dynamodb-table-unencrypted
  # SSE is enabled with AWS-managed keys (free tier). Customer KMS key is optional
  # hardening that costs $1/month — deferred per the free-tier cost constraint.
  server_side_encryption {
    enabled = true
  }

  tags = local.tags
}
