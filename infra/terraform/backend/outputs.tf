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

output "backend_target_group_arn" {
    description = "ARN of the backend target group"
    value       = aws_lb_target_group.backend_target_group.arn
}

output "auto_scaling_group_name" {
    description = "Name of the Auto Scaling Group"
    value       = aws_autoscaling_group.backend_asg.name
}

output "mongodb_private_ip" {
    description = "Private IP address of MongoDB instance"
    value       = aws_instance.mongodb_instance.private_ip
}

output "backend_url" {
    description = "URL to access the backend API"
    value       = "http://${aws_lb.careervault_alb.dns_name}"
}

output "cloudwatch_log_group_backend" {
    description = "CloudWatch Log Group for backend"
    value       = aws_cloudwatch_log_group.backend_logs.name
}

output "cloudwatch_log_group_mongodb" {
    description = "CloudWatch Log Group for MongoDB"
    value       = aws_cloudwatch_log_group.mongodb_logs.name
}
