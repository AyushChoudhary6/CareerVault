# ===================================================================
# Backend Infrastructure - CareerVault with DynamoDB + Simple JWT
# ===================================================================

provider "aws" {
    region = var.aws_region
}

# Data sources to get networking info
data "terraform_remote_state" "networking" {
    backend = "local"
    config = {
        path = "../networking/terraform.tfstate"
    }
}

# ===================================================================
# DynamoDB Tables
# ===================================================================

# Users Table
resource "aws_dynamodb_table" "users_table" {
    name           = "${var.project_name}-Users"
    billing_mode   = "PAY_PER_REQUEST"
    hash_key       = "id"

    attribute {
        name = "id"
        type = "S"
    }

    attribute {
        name = "email"
        type = "S"
    }

    global_secondary_index {
        name            = "EmailIndex"
        hash_key        = "email"
        projection_type = "ALL"
    }

    tags = {
        Name        = "${var.project_name}-Users"
        Project     = var.project_name
        Environment = var.environment
    }
}

# Jobs Table
resource "aws_dynamodb_table" "jobs_table" {
    name           = "${var.project_name}-Jobs"
    billing_mode   = "PAY_PER_REQUEST"
    hash_key       = "id"

    attribute {
        name = "id"
        type = "S"
    }

    attribute {
        name = "user_id"
        type = "S"
    }

    global_secondary_index {
        name            = "UserJobsIndex"
        hash_key        = "user_id"
        projection_type = "ALL"
    }

    tags = {
        Name        = "${var.project_name}-Jobs"
        Project     = var.project_name
        Environment = var.environment
    }
}

# ===================================================================
# Application Load Balancer
# ===================================================================

resource "aws_lb" "careervault_alb" {
    name               = "${var.project_name}-ALB"
    internal           = false
    load_balancer_type = "application"
    security_groups    = [data.terraform_remote_state.networking.outputs.alb_security_group_id]
    subnets           = [
        data.terraform_remote_state.networking.outputs.public_subnet_1_id,
        data.terraform_remote_state.networking.outputs.public_subnet_2_id
    ]

    enable_deletion_protection = false

    tags = {
        Name        = "${var.project_name}-ALB"
        Project     = var.project_name
        Environment = var.environment
    }
}

# Target Group for Backend
resource "aws_lb_target_group" "backend_target_group" {
    name     = "${var.project_name}-backend-tg"
    port     = 8000
    protocol = "HTTP"
    vpc_id   = data.terraform_remote_state.networking.outputs.vpc_id

    health_check {
        enabled             = true
        healthy_threshold   = 2
        interval            = 30
        matcher             = "200"
        path                = "/"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 5
        unhealthy_threshold = 2
    }

    tags = {
        Name        = "${var.project_name}-backend-tg"
        Project     = var.project_name
        Environment = var.environment
    }
}

# ALB Listener
resource "aws_lb_listener" "backend_listener" {
    load_balancer_arn = aws_lb.careervault_alb.arn
    port              = "80"
    protocol          = "HTTP"

    default_action {
        type             = "forward"
        target_group_arn = aws_lb_target_group.backend_target_group.arn
    }
}

# ===================================================================
# IAM Roles and Policies
# ===================================================================

# IAM Role for EC2 instances
resource "aws_iam_role" "ec2_role" {
    name = "${var.project_name}-EC2-Role"

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "ec2.amazonaws.com"
                }
            }
        ]
    })

    tags = {
        Name        = "${var.project_name}-EC2-Role"
        Project     = var.project_name
        Environment = var.environment
    }
}

# Policy for DynamoDB access
resource "aws_iam_policy" "dynamodb_policy" {
    name        = "${var.project_name}-DynamoDB-Policy"
    description = "Policy for DynamoDB access"

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "dynamodb:BatchGetItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:Scan",
                    "dynamodb:BatchWriteItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem"
                ]
                Resource = [
                    aws_dynamodb_table.users_table.arn,
                    aws_dynamodb_table.jobs_table.arn,
                    "${aws_dynamodb_table.users_table.arn}/index/*",
                    "${aws_dynamodb_table.jobs_table.arn}/index/*"
                ]
            }
        ]
    })
}

# Policy for CloudWatch Logs
resource "aws_iam_policy" "cloudwatch_logs_policy" {
    name        = "${var.project_name}-CloudWatch-Logs-Policy"
    description = "Policy for CloudWatch Logs access"

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                    "logs:DescribeLogStreams"
                ]
                Resource = "arn:aws:logs:*:*:*"
            }
        ]
    })
}

# Attach DynamoDB policy to role
resource "aws_iam_role_policy_attachment" "dynamodb_attachment" {
    role       = aws_iam_role.ec2_role.name
    policy_arn = aws_iam_policy.dynamodb_policy.arn
}

# Attach CloudWatch policy to role
resource "aws_iam_role_policy_attachment" "cloudwatch_logs_attachment" {
    role       = aws_iam_role.ec2_role.name
    policy_arn = aws_iam_policy.cloudwatch_logs_policy.arn
}

# Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
    name = "${var.project_name}-EC2-Profile"
    role = aws_iam_role.ec2_role.name
}

# ===================================================================
# Launch Template and Auto Scaling
# ===================================================================

resource "aws_launch_template" "backend_launch_template" {
    name_prefix   = "${var.project_name}-backend-"
    image_id      = var.ami_id
    instance_type = var.instance_type
    key_name      = var.key_pair_name != "" ? var.key_pair_name : null

    vpc_security_group_ids = [data.terraform_remote_state.networking.outputs.backend_security_group_id]

    iam_instance_profile {
        name = aws_iam_instance_profile.ec2_profile.name
    }

    user_data = base64encode(templatefile("${path.module}/user_data_dynamodb.sh", {
        aws_region         = var.aws_region
        gemini_api_key     = var.gemini_api_key
        users_table_name   = aws_dynamodb_table.users_table.name
        jobs_table_name    = aws_dynamodb_table.jobs_table.name
        project_name       = var.project_name
    }))

    tag_specifications {
        resource_type = "instance"
        tags = {
            Name        = "${var.project_name}-Backend"
            Project     = var.project_name
            Environment = var.environment
        }
    }

    tags = {
        Name        = "${var.project_name}-backend-template"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_autoscaling_group" "backend_asg" {
    name                = "${var.project_name}-backend-asg"
    vpc_zone_identifier = [
        data.terraform_remote_state.networking.outputs.private_subnet_1_id,
        data.terraform_remote_state.networking.outputs.private_subnet_2_id
    ]
    target_group_arns   = [aws_lb_target_group.backend_target_group.arn]
    health_check_type   = "ELB"
    health_check_grace_period = 300

    min_size         = var.min_size
    max_size         = var.max_size
    desired_capacity = var.desired_capacity

    launch_template {
        id      = aws_launch_template.backend_launch_template.id
        version = "$Latest"
    }

    tag {
        key                 = "Name"
        value               = "${var.project_name}-backend-asg"
        propagate_at_launch = false
    }

    tag {
        key                 = "Project"
        value               = var.project_name
        propagate_at_launch = true
    }

    tag {
        key                 = "Environment"
        value               = var.environment
        propagate_at_launch = true
    }
}

# ===================================================================
# CloudWatch Log Groups
# ===================================================================

resource "aws_cloudwatch_log_group" "backend_logs" {
    name              = "/aws/ec2/${var.project_name}/backend"
    retention_in_days = 14

    tags = {
        Name        = "${var.project_name}-backend-logs"
        Project     = var.project_name
        Environment = var.environment
    }
}

# ===================================================================
# S3 Storage
# ===================================================================

# S3 Bucket for file uploads (resumes, documents)
resource "aws_s3_bucket" "storage_bucket" {
    bucket = "${lower(var.project_name)}-storage-${random_string.bucket_suffix.result}"

    tags = {
        Name        = "${var.project_name}-Storage"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "random_string" "bucket_suffix" {
    length  = 8
    special = false
    upper   = false
}

# S3 Bucket versioning
resource "aws_s3_bucket_versioning" "storage_bucket_versioning" {
    bucket = aws_s3_bucket.storage_bucket.id
    versioning_configuration {
        status = "Enabled"
    }
}

# S3 Bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "storage_bucket_encryption" {
    bucket = aws_s3_bucket.storage_bucket.id

    rule {
        apply_server_side_encryption_by_default {
            sse_algorithm = "AES256"
        }
    }
}

# S3 Bucket public access block
resource "aws_s3_bucket_public_access_block" "storage_bucket_pab" {
    bucket = aws_s3_bucket.storage_bucket.id

    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
}

# ===================================================================
# RDS (Relational Database)
# ===================================================================

# DB Subnet Group
resource "aws_db_subnet_group" "careervault_db_subnet_group" {
    name       = "${lower(var.project_name)}-db-subnet-group"
    subnet_ids = [
        data.terraform_remote_state.networking.outputs.private_subnet_1_id,
        data.terraform_remote_state.networking.outputs.private_subnet_2_id
    ]

    tags = {
        Name        = "${var.project_name}-DB-SubnetGroup"
        Project     = var.project_name
        Environment = var.environment
    }
}

# RDS Instance (PostgreSQL)
resource "aws_db_instance" "careervault_db" {
    identifier     = "${lower(var.project_name)}-database"
    engine         = "postgres"
    engine_version = "15.4"
    instance_class = var.db_instance_class
    
    allocated_storage     = 20
    max_allocated_storage = 100
    storage_type          = "gp2"
    storage_encrypted     = true

    db_name  = "careervault"
    username = "careervault_admin"
    password = random_password.db_password.result

    vpc_security_group_ids = [data.terraform_remote_state.networking.outputs.database_security_group_id]
    db_subnet_group_name   = aws_db_subnet_group.careervault_db_subnet_group.name

    backup_retention_period = 7
    backup_window          = "03:00-04:00"
    maintenance_window     = "sun:04:00-sun:05:00"

    skip_final_snapshot = var.environment != "production"
    deletion_protection = var.environment == "production"

    # Enable enhanced monitoring
    monitoring_interval = 60
    monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring.arn

    # Enable performance insights
    performance_insights_enabled = true

    tags = {
        Name        = "${var.project_name}-Database"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "random_password" "db_password" {
    length  = 16
    special = true
}

# RDS Enhanced Monitoring Role
resource "aws_iam_role" "rds_enhanced_monitoring" {
    name = "${var.project_name}-RDS-EnhancedMonitoring"

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "monitoring.rds.amazonaws.com"
                }
            }
        ]
    })
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
    role       = aws_iam_role.rds_enhanced_monitoring.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ===================================================================
# Secrets Manager
# ===================================================================

# Store database credentials
resource "aws_secretsmanager_secret" "db_credentials" {
    name        = "${var.project_name}/database/credentials"
    description = "Database credentials for ${var.project_name}"

    tags = {
        Name        = "${var.project_name}-DB-Credentials"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
    secret_id = aws_secretsmanager_secret.db_credentials.id
    secret_string = jsonencode({
        username = aws_db_instance.careervault_db.username
        password = random_password.db_password.result
        engine   = "postgres"
        host     = aws_db_instance.careervault_db.endpoint
        port     = aws_db_instance.careervault_db.port
        dbname   = aws_db_instance.careervault_db.db_name
    })
}

# Store Gemini API Key
resource "aws_secretsmanager_secret" "gemini_api_key" {
    name        = "${var.project_name}/api/gemini-key"
    description = "Gemini API Key for ${var.project_name}"

    tags = {
        Name        = "${var.project_name}-Gemini-Key"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_secretsmanager_secret_version" "gemini_api_key" {
    secret_id     = aws_secretsmanager_secret.gemini_api_key.id
    secret_string = var.gemini_api_key
}

# Store JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
    name        = "${var.project_name}/api/jwt-secret"
    description = "JWT Secret for ${var.project_name}"

    tags = {
        Name        = "${var.project_name}-JWT-Secret"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
    secret_id     = aws_secretsmanager_secret.jwt_secret.id
    secret_string = random_password.jwt_secret.result
}

resource "random_password" "jwt_secret" {
    length  = 32
    special = true
}

# ===================================================================
# Systems Manager Parameter Store
# ===================================================================

resource "aws_ssm_parameter" "app_environment" {
    name  = "/${var.project_name}/config/environment"
    type  = "String"
    value = var.environment

    tags = {
        Name        = "${var.project_name}-Environment"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_ssm_parameter" "s3_bucket_name" {
    name  = "/${var.project_name}/config/s3-bucket"
    type  = "String"
    value = aws_s3_bucket.storage_bucket.bucket

    tags = {
        Name        = "${var.project_name}-S3-Bucket"
        Project     = var.project_name
        Environment = var.environment
    }
}

# ===================================================================
# CloudTrail for Security Auditing
# ===================================================================

# S3 Bucket for CloudTrail logs
resource "aws_s3_bucket" "cloudtrail_bucket" {
    bucket = "${lower(var.project_name)}-cloudtrail-${random_string.cloudtrail_suffix.result}"

    tags = {
        Name        = "${var.project_name}-CloudTrail"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "random_string" "cloudtrail_suffix" {
    length  = 8
    special = false
    upper   = false
}

# CloudTrail bucket policy
resource "aws_s3_bucket_policy" "cloudtrail_bucket_policy" {
    bucket = aws_s3_bucket.cloudtrail_bucket.id

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Sid    = "AWSCloudTrailAclCheck"
                Effect = "Allow"
                Principal = {
                    Service = "cloudtrail.amazonaws.com"
                }
                Action   = "s3:GetBucketAcl"
                Resource = aws_s3_bucket.cloudtrail_bucket.arn
            },
            {
                Sid    = "AWSCloudTrailWrite"
                Effect = "Allow"
                Principal = {
                    Service = "cloudtrail.amazonaws.com"
                }
                Action   = "s3:PutObject"
                Resource = "${aws_s3_bucket.cloudtrail_bucket.arn}/*"
                Condition = {
                    StringEquals = {
                        "s3:x-amz-acl" = "bucket-owner-full-control"
                    }
                }
            }
        ]
    })
}

# CloudTrail
resource "aws_cloudtrail" "careervault_trail" {
    name           = "${var.project_name}-CloudTrail"
    s3_bucket_name = aws_s3_bucket.cloudtrail_bucket.bucket

    include_global_service_events = true
    is_multi_region_trail        = true
    enable_logging              = true

    event_selector {
        read_write_type                 = "All"
        include_management_events       = true
        exclude_management_event_sources = ["kms.amazonaws.com", "rdsdata.amazonaws.com"]

        data_resource {
            type   = "AWS::S3::Object"
            values = ["${aws_s3_bucket.storage_bucket.arn}/*"]
        }

        data_resource {
            type   = "AWS::DynamoDB::Table"
            values = [
                aws_dynamodb_table.users_table.arn,
                aws_dynamodb_table.jobs_table.arn
            ]
        }
    }

    tags = {
        Name        = "${var.project_name}-CloudTrail"
        Project     = var.project_name
        Environment = var.environment
    }
}

# ===================================================================
# CloudWatch Monitoring & Alarms
# ===================================================================

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "careervault_dashboard" {
    dashboard_name = "${var.project_name}-Dashboard"

    dashboard_body = jsonencode({
        widgets = [
            {
                type   = "metric"
                x      = 0
                y      = 0
                width  = 12
                height = 6

                properties = {
                    metrics = [
                        ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.careervault_alb.arn_suffix],
                        [".", "TargetResponseTime", ".", "."],
                        [".", "HTTPCode_Target_2XX_Count", ".", "."],
                        [".", "HTTPCode_Target_4XX_Count", ".", "."],
                        [".", "HTTPCode_Target_5XX_Count", ".", "."]
                    ]
                    view    = "timeSeries"
                    stacked = false
                    region  = var.aws_region
                    title   = "ALB Metrics"
                    period  = 300
                }
            },
            {
                type   = "metric"
                x      = 0
                y      = 6
                width  = 12
                height = 6

                properties = {
                    metrics = [
                        ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", aws_autoscaling_group.backend_asg.name],
                        [".", "NetworkIn", ".", "."],
                        [".", "NetworkOut", ".", "."]
                    ]
                    view    = "timeSeries"
                    stacked = false
                    region  = var.aws_region
                    title   = "EC2 Metrics"
                    period  = 300
                }
            }
        ]
    })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
    alarm_name          = "${var.project_name}-high-cpu"
    comparison_operator = "GreaterThanThreshold"
    evaluation_periods  = "2"
    metric_name         = "CPUUtilization"
    namespace           = "AWS/EC2"
    period              = "120"
    statistic           = "Average"
    threshold           = "80"
    alarm_description   = "This metric monitors ec2 cpu utilization"
    alarm_actions       = [aws_sns_topic.alerts.arn]

    dimensions = {
        AutoScalingGroupName = aws_autoscaling_group.backend_asg.name
    }

    tags = {
        Name        = "${var.project_name}-high-cpu-alarm"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_cloudwatch_metric_alarm" "alb_response_time" {
    alarm_name          = "${var.project_name}-alb-response-time"
    comparison_operator = "GreaterThanThreshold"
    evaluation_periods  = "2"
    metric_name         = "TargetResponseTime"
    namespace           = "AWS/ApplicationELB"
    period              = "120"
    statistic           = "Average"
    threshold           = "1"
    alarm_description   = "This metric monitors ALB response time"
    alarm_actions       = [aws_sns_topic.alerts.arn]

    dimensions = {
        LoadBalancer = aws_lb.careervault_alb.arn_suffix
    }

    tags = {
        Name        = "${var.project_name}-alb-response-time-alarm"
        Project     = var.project_name
        Environment = var.environment
    }
}

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
    name = "${var.project_name}-alerts"

    tags = {
        Name        = "${var.project_name}-alerts"
        Project     = var.project_name
        Environment = var.environment
    }
}

# ===================================================================
# Updated IAM Policies for Additional Services
# ===================================================================

# Policy for Secrets Manager access
resource "aws_iam_policy" "secrets_manager_policy" {
    name        = "${var.project_name}-SecretsManager-Policy"
    description = "Policy for Secrets Manager access"

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "secretsmanager:GetSecretValue",
                    "secretsmanager:DescribeSecret"
                ]
                Resource = [
                    aws_secretsmanager_secret.db_credentials.arn,
                    aws_secretsmanager_secret.gemini_api_key.arn,
                    aws_secretsmanager_secret.jwt_secret.arn
                ]
            }
        ]
    })
}

# Policy for S3 access
resource "aws_iam_policy" "s3_policy" {
    name        = "${var.project_name}-S3-Policy"
    description = "Policy for S3 access"

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject",
                    "s3:ListBucket"
                ]
                Resource = [
                    aws_s3_bucket.storage_bucket.arn,
                    "${aws_s3_bucket.storage_bucket.arn}/*"
                ]
            }
        ]
    })
}

# Policy for Systems Manager Parameter Store
resource "aws_iam_policy" "ssm_policy" {
    name        = "${var.project_name}-SSM-Policy"
    description = "Policy for Systems Manager Parameter Store access"

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "ssm:GetParameter",
                    "ssm:GetParameters",
                    "ssm:GetParametersByPath"
                ]
                Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/${var.project_name}/*"
            }
        ]
    })
}

# Attach additional policies to EC2 role
resource "aws_iam_role_policy_attachment" "secrets_manager_attachment" {
    role       = aws_iam_role.ec2_role.name
    policy_arn = aws_iam_policy.secrets_manager_policy.arn
}

resource "aws_iam_role_policy_attachment" "s3_attachment" {
    role       = aws_iam_role.ec2_role.name
    policy_arn = aws_iam_policy.s3_policy.arn
}

resource "aws_iam_role_policy_attachment" "ssm_attachment" {
    role       = aws_iam_role.ec2_role.name
    policy_arn = aws_iam_policy.ssm_policy.arn
}
