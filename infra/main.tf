terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }

  # State key is passed at init time:
  #   terraform init -backend-config="key=bba/dev/terraform.tfstate"
  # The bootstrap/ directory must be applied first to create this bucket.
  backend "s3" {
    bucket         = "bba-terraform-state-958941188378"
    region         = "us-east-1"
    dynamodb_table = "bba-terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}

# ---------------------------------------------------------------------------
# Account-level data sources
# ---------------------------------------------------------------------------

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# GitHub OIDC provider — created once by bootstrap/, referenced here.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}
