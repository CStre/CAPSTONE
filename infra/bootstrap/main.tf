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

resource "aws_dynamodb_table" "tf_state_lock" {
  name         = "bba-terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
  }
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
