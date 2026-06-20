# DynamoDB table for per-user preference data.
# Cognito owns identity; this table holds only app data.
#
# Schema:
#   PK  userId  (String) — Cognito sub
#   MAP preferences { countryCode -> Number 0-100 } (sparse)
#   STR createdAt (ISO 8601)

resource "aws_dynamodb_table" "prefs" { # nosemgrep: terraform.aws.security.aws-dynamodb-table-unencrypted.aws-dynamodb-table-unencrypted
  name         = "${local.prefix}-prefs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  server_side_encryption {
    enabled = true # nosemgrep: terraform.aws.security.aws-dynamodb-table-unencrypted.aws-dynamodb-table-unencrypted
  }

  tags = local.tags
}
