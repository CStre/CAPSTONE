locals {
  env    = var.environment
  prefix = "bba-${local.env}"

  is_prod = local.env == "prod"

  domain      = "buildbetteralgorithms.com"
  github_repo = "CStre/CAPSTONE"
  account_id  = data.aws_caller_identity.current.account_id
  region      = "us-east-1"

  tags = {
    Project     = "bba"
    Environment = local.env
    ManagedBy   = "terraform"
  }
}
