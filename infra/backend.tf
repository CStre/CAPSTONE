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

# Cognito — delete user on account deletion
resource "aws_iam_role_policy" "lambda_cognito" {
  name = "cognito"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["cognito-idp:AdminDeleteUser"]
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

  # Cap concurrency to limit blast radius and runaway cost
  reserved_concurrent_executions = 10

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      ENVIRONMENT          = local.env
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      COGNITO_REGION       = local.region
      DYNAMODB_TABLE       = aws_dynamodb_table.prefs.name
      SSM_PREFIX           = "/bba/${local.env}"
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
# Lambda Function URL — HTTPS endpoint consumed by CloudFront as an origin.
# auth=NONE because CloudFront is the only caller and the Lambda verifies
# Cognito JWTs itself.
# ---------------------------------------------------------------------------

resource "aws_lambda_function_url" "graphql" {
  function_name      = aws_lambda_function.graphql.function_name
  authorization_type = "NONE"
}
