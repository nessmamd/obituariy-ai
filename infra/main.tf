terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}


# the locals block is used to declare constants that 
# you can use throughout your code
locals {
  get_name = "get_obituaries_30140419"
  create_name = "create_obituary_30140419"
  audio_name = "get_audio_30147402"
  handler_name  = "main.handler"
  get_artifact = "get-artifact.zip"
  create_artifact = "create-artifact.zip"
  audio_artifact = "get-audio.zip"
}


# one dynamodb table that stores the information ... can we first try deploying this 

resource "aws_dynamodb_table" "obituary_30147402"{
  name            = "obituary_30147402" #name of the database and needs to be unique within the region
  billing_mode    = "PROVISIONED"
  read_capacity   = 1
  write_capacity  = 1 
  hash_key        = "deadID" #required and it allows for the addition of things... could just be the dead persons name
  attribute {
    name          = "deadID"
    type          = "S"
  } 
}
# roles and policies as needed
# create a role for the Lambda function to assume
# every service on AWS that wants to call other AWS services should first assume a role and
# then any policy attached to the role will give permissions
# to the service so it can interact with other AWS services
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role

data "archive_file" "get_zip"{
  type = "zip"
  source_file = "../functions/get-obituaries/main.py"
  output_path = local.get_artifact
}

data "archive_file" "create_zip"{
  type = "zip"
  source_dir = "../functions/create-obituary"
  output_path = local.create_artifact
}

resource "aws_iam_role" "lambda" {
  name               = "iam-for-lambda-policies"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    },
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "states.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }

  ]
}
EOF
}

resource "aws_iam_policy" "logs" {
  name        = "lambda-logging-policies"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "states:StartExecution",
          "states:DescribeExecution",
          "lambda:*",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "s3:*",
          "ssm:GetParameters",
          "polly:SynthesizeSpeech"
      ],
      "Resource": [
        "*",
        "${aws_dynamodb_table.obituary_30147402.arn}"
        ],
      "Effect": "Allow"
    }
  ]
}
EOF
}



# attach the above policy to the function role
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.logs.arn
}

# Create an S3 bucket
resource "aws_s3_bucket" "lambda" {
  bucket = "audios-30147402"
}

# two lambda functions w/ function url
# creating lambda functions
resource "aws_lambda_function" "lambda-create" {
  role             = aws_iam_role.lambda.arn
  function_name    = local.create_name
  handler          = local.handler_name
  filename         = local.create_artifact
  source_code_hash = data.archive_file.create_zip.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
  timeout = 20
}

resource "aws_lambda_function" "lambda-get" {
  role             = aws_iam_role.lambda.arn
  function_name    = local.get_name
  handler          = local.handler_name
  filename         = local.get_artifact
  source_code_hash = data.archive_file.get_zip.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"

  environment {
    variables = {
      "ACCESS_CONTROL_ALLOW_ORIGIN" = "*"
      "ACCESS_CONTROL_ALLOW_METHODS" = "GET,POST,PUT,DELETE"
      "ACCESS_CONTROL_ALLOW_HEADERS" = "*"
    }
  }
}

# create a Function URL for Lambda 
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function_url
resource "aws_lambda_function_url" "url-create" {
  function_name      = aws_lambda_function.lambda-create.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}
resource "aws_lambda_function_url" "url-get" {
  function_name      = aws_lambda_function.lambda-get.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# resource "aws_iam_user_policy_attachment" "attachment" {
#   user       = aws_iam_user.new_user.name
#   policy_arn = aws_iam_policy.policy.arn
# }

# output "rendered_policy" {
#   value = data.aws_iam_policy_document.example.json
# }

# show the Function URL after creation, these are to be used in the code
output "lambda_url_create" {
  value = aws_lambda_function_url.url-create.function_url
}
output "lambda_url_get" {
  value = aws_lambda_function_url.url-get.function_url
}

output "bucket_name" {
  value = aws_s3_bucket.lambda.bucket
}
