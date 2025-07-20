output "s3_bucket_name" {
    description = "Name of the S3 bucket"
    value       = aws_s3_bucket.frontend_bucket.bucket
}

output "s3_bucket_website_endpoint" {
    description = "Website endpoint for the S3 bucket"
    value       = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}

output "s3_bucket_website_url" {
    description = "Website URL for the S3 bucket"
    value       = "http://${aws_s3_bucket_website_configuration.frontend_website.website_endpoint}"
}
