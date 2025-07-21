output "alb_dns_name" {
    description = "DNS name of the Application Load Balancer"
    value       = aws_lb.careervault_alb.dns_name
}

output "alb_zone_id" {
    description = "Zone ID of the Application Load Balancer"
    value       = aws_lb.careervault_alb.zone_id
}

output "alb_arn" {
    description = "ARN of the Application Load Balancer"
    value       = aws_lb.careervault_alb.arn
}

output "dynamodb_users_table_name" {
    description = "Name of the Users DynamoDB table"
    value       = aws_dynamodb_table.users_table.name
}

output "dynamodb_jobs_table_name" {
    description = "Name of the Jobs DynamoDB table"
    value       = aws_dynamodb_table.jobs_table.name
}

output "rds_endpoint" {
    description = "RDS instance endpoint"
    value       = aws_db_instance.careervault_db.endpoint
    sensitive   = true
}

output "rds_port" {
    description = "RDS instance port"
    value       = aws_db_instance.careervault_db.port
}

output "s3_storage_bucket_name" {
    description = "Name of the S3 storage bucket"
    value       = aws_s3_bucket.storage_bucket.bucket
}

output "s3_storage_bucket_arn" {
    description = "ARN of the S3 storage bucket"
    value       = aws_s3_bucket.storage_bucket.arn
}

output "cloudtrail_bucket_name" {
    description = "Name of the CloudTrail S3 bucket"
    value       = aws_s3_bucket.cloudtrail_bucket.bucket
}

output "secrets_manager_db_secret_arn" {
    description = "ARN of the database credentials secret"
    value       = aws_secretsmanager_secret.db_credentials.arn
    sensitive   = true
}

output "secrets_manager_jwt_secret_arn" {
    description = "ARN of the JWT secret"
    value       = aws_secretsmanager_secret.jwt_secret.arn
    sensitive   = true
}

output "secrets_manager_gemini_secret_arn" {
    description = "ARN of the Gemini API key secret"
    value       = aws_secretsmanager_secret.gemini_api_key.arn
    sensitive   = true
}

output "cloudwatch_dashboard_url" {
    description = "URL to the CloudWatch dashboard"
    value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.careervault_dashboard.dashboard_name}"
}

output "sns_topic_arn" {
    description = "ARN of the SNS alerts topic"
    value       = aws_sns_topic.alerts.arn
}

output "cloudtrail_arn" {
    description = "ARN of the CloudTrail"
    value       = aws_cloudtrail.careervault_trail.arn
}

# Auto Scaling Group outputs
output "autoscaling_group_name" {
    description = "Name of the Auto Scaling Group"
    value       = aws_autoscaling_group.backend_asg.name
}

output "autoscaling_group_arn" {
    description = "ARN of the Auto Scaling Group"
    value       = aws_autoscaling_group.backend_asg.arn
}

output "launch_template_id" {
    description = "ID of the Launch Template"
    value       = aws_launch_template.backend_template.id
}

# API Base URL
output "api_base_url" {
    description = "Base URL for the API"
    value       = "http://${aws_lb.careervault_alb.dns_name}"
}

# Environment Information
output "deployment_info" {
    description = "Deployment information"
    value = {
        project_name = var.project_name
        environment  = var.environment
        region       = var.aws_region
        deployed_at  = timestamp()
    }
}
