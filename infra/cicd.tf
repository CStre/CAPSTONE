# GitHub Actions deploy roles — one per environment.
# Each role is assumable only from the matching GitHub Environment
# (dev / qa / production), scoped to the CStre/CAPSTONE repo.
#
# The OIDC provider itself is created by bootstrap/ and referenced here
# via data "aws_iam_openid_connect_provider" "github" in main.tf.
#
# Permissions: AdministratorAccess is used for Terraform apply in CI.
# For a production hardening pass, scope this down to exactly the actions
# each pipeline step needs (ECR push, S3 sync, Lambda update, tf apply).

locals {
  # Maps Terraform environment name → GitHub Environment name
  github_env = {
    dev  = "dev"
    qa   = "qa"
    prod = "production"
  }
}

resource "aws_iam_role" "deploy" {
  name = "${local.prefix}-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Federated = data.aws_iam_openid_connect_provider.github.arn }
        Action    = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            # Only the matching GitHub Environment may assume this role
            "token.actions.githubusercontent.com:sub" = "repo:${local.github_repo}:environment:${local.github_env[local.env]}"
          }
        }
      },
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "deploy_admin" {
  role       = aws_iam_role.deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
