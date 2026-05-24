# ---------------------------------------------------------------------------
# Outputs consumed by CI/CD to generate the frontend .env and Lambda config
# ---------------------------------------------------------------------------

output "cloudfront_domain" {
  description = "CloudFront distribution domain (use as VITE_GRAPHQL_URL base)"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "Used by CI to invalidate the CloudFront cache after frontend deploy"
  value       = aws_cloudfront_distribution.main.id
}

output "frontend_bucket" {
  description = "S3 bucket name for the React build — CI syncs here"
  value       = aws_s3_bucket.frontend.bucket
}

output "ecr_repository_url" {
  description = "ECR repository URL for the Lambda container image"
  value       = aws_ecr_repository.lambda.repository_url
}

output "lambda_function_name" {
  description = "Lambda function name — CI calls update-function-code after image push"
  value       = aws_lambda_function.graphql.function_name
}

output "lambda_function_url" {
  description = "Raw Lambda Function URL (CloudFront proxies /graphql here)"
  value       = aws_lambda_function_url.graphql.function_url
  sensitive   = false
}

output "cognito_user_pool_id" {
  description = "VITE_COGNITO_USER_POOL_ID for the frontend .env"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "VITE_COGNITO_CLIENT_ID for the frontend .env"
  value       = aws_cognito_user_pool_client.main.id
}

output "deploy_role_arn" {
  description = "IAM role ARN for GitHub Actions to assume in this environment"
  value       = aws_iam_role.deploy.arn
}

output "graphql_url" {
  description = "Full GraphQL endpoint URL (VITE_GRAPHQL_URL)"
  value       = local.is_prod ? "https://${local.domain}/graphql" : "https://${aws_cloudfront_distribution.main.domain_name}/graphql"
}
