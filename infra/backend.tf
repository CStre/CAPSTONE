# ---------------------------------------------------------------------------
# ECR repository — stores the Lambda container image
# ---------------------------------------------------------------------------

resource "aws_ecr_repository" "lambda" {
  name                 = "${local.prefix}-graphql"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = local.tags
}

# Keep only the 5 most recent images to stay within ECR free-storage limits
resource "aws_ecr_lifecycle_policy" "lambda" {
  repository = aws_ecr_repository.lambda.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Retain only 5 most-recent images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = { type = "expire" }
      },
    ]
  })
}

# ---------------------------------------------------------------------------
# Lambda IAM execution role
# ---------------------------------------------------------------------------

resource "aws_iam_role" "lambda" {
  name = "${local.prefix}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = "sts:AssumeRole"
      },
    ]
  })

  tags = local.tags
}

# Basic execution (CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB — read/write the prefs table only
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "dynamodb"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ]
        Resource = aws_dynamodb_table.prefs.arn
      },
    ]
  })
}

# SSM — read parameters scoped to this environment
resource "aws_iam_role_policy" "lambda_ssm" {
  name = "ssm"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParameters"]
        Resource = "arn:aws:ssm:${local.region}:${local.account_id}:parameter/bba/${local.env}/*"
      },
    ]
  })
}

# Cognito — delete user + list users by phone (forgot-email flow)
resource "aws_iam_role_policy" "lambda_cognito" {
  name = "cognito"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["cognito-idp:AdminDeleteUser", "cognito-idp:ListUsers"]
        Resource = aws_cognito_user_pool.main.arn
      },
    ]
  })
}

# ---------------------------------------------------------------------------
# CloudWatch log group — explicit so we can control retention
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.prefix}-graphql"
  retention_in_days = 7
  tags              = local.tags
}

# ---------------------------------------------------------------------------
# Lambda function (container image)
#
# BOOTSTRAP NOTE: The function cannot be created until a container image exists
# in ECR. The CI/CD pipeline handles this order:
#   1. terraform apply -target=aws_ecr_repository.lambda  (creates ECR)
#   2. docker build + push :latest to ECR
#   3. terraform apply  (creates the Lambda with the real image)
#
# On subsequent deploys the pipeline builds, pushes, then calls:
#   aws lambda update-function-code --image-uri <new-uri>
# and terraform apply (which ignores image_uri changes via lifecycle below).
# ---------------------------------------------------------------------------

resource "aws_lambda_function" "graphql" {
  function_name = "${local.prefix}-graphql"
  role          = aws_iam_role.lambda.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.lambda.repository_url}:placeholder"

  timeout     = 30
  memory_size = 512

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      NODE_ENV             = "production"
      AUTH_MODE            = "cognito"
      ENVIRONMENT          = local.env
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.main.id
      COGNITO_REGION       = local.region
      DYNAMODB_TABLE       = aws_dynamodb_table.prefs.name
      SSM_PREFIX           = "/bba/${local.env}"
      # Passed directly — Lambda env vars are KMS-encrypted at rest. SSM is the
      # stricter option (access logged, zero console exposure) but requires an async
      # init path that is deferred to a future hardening pass.
      UNSPLASH_ACCESS_KEY = var.unsplash_access_key
    }
  }

  # CI updates the image; Terraform does not overwrite image_uri on subsequent applies
  lifecycle {
    ignore_changes = [image_uri]
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.lambda,
  ]

  tags = local.tags
}

# ---------------------------------------------------------------------------
# API Gateway HTTP API — public HTTPS endpoint that proxies POST /graphql to
# the Lambda. Replaces the Lambda Function URL: this account's new-account
# guardrails block anonymous Function URL access, and CloudFront OAC SigV4
# signing of Function URLs is fragile in practice. API Gateway HTTP APIs are
# free for the first 1M requests/month and route to Lambda over the same
# payload-format v2 our handler already expects.
# ---------------------------------------------------------------------------

resource "aws_apigatewayv2_api" "graphql" {
  name          = "${local.prefix}-graphql"
  protocol_type = "HTTP"

  tags = local.tags
}

resource "aws_apigatewayv2_integration" "graphql" {
  api_id                 = aws_apigatewayv2_api.graphql.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.graphql.invoke_arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

# Match every method/path; GraphQL Yoga handles routing itself (POST /graphql,
# GET /graphql for introspection, OPTIONS for CORS preflight).
resource "aws_apigatewayv2_route" "graphql" {
  api_id    = aws_apigatewayv2_api.graphql.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.graphql.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.graphql.id
  name        = "$default"
  auto_deploy = true

  tags = local.tags
}

resource "aws_lambda_permission" "apigateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.graphql.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.graphql.execution_arn}/*/*"
}
