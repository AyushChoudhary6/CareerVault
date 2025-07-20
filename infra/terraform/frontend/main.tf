provider "aws" {
    region = var.aws_region
}

# S3 bucket for frontend hosting
resource "aws_s3_bucket" "frontend_bucket" {
    bucket = var.frontend_bucket_name

    tags = {
        Name        = "${var.project_name}-frontend-bucket"
        Project     = var.project_name
        Environment = var.environment
    }
}

# Configure S3 bucket website
resource "aws_s3_bucket_website_configuration" "frontend_website" {
    bucket = aws_s3_bucket.frontend_bucket.id

    index_document {
        suffix = "index.html"
    }

    error_document {
        key = "index.html"
    }
}

# Configure S3 bucket public access block (allow public read)
resource "aws_s3_bucket_public_access_block" "frontend_pab" {
    bucket = aws_s3_bucket.frontend_bucket.id

    block_public_acls       = false
    block_public_policy     = false
    ignore_public_acls      = false
    restrict_public_buckets = false
}

# S3 bucket policy to allow public read access
resource "aws_s3_bucket_policy" "frontend_policy" {
    bucket = aws_s3_bucket.frontend_bucket.id
    policy = data.aws_iam_policy_document.frontend_policy.json

    depends_on = [aws_s3_bucket_public_access_block.frontend_pab]
}

# IAM policy document for public read access
data "aws_iam_policy_document" "frontend_policy" {
    statement {
        actions   = ["s3:GetObject"]
        resources = ["${aws_s3_bucket.frontend_bucket.arn}/*"]

        principals {
            type        = "*"
            identifiers = ["*"]
        }
    }
}
