provider "aws" {
    region = var.aws_region
}

# Data sources to get networking info (if using remote state)
data "terraform_remote_state" "networking" {
    backend = "local"
    config = {
        path = "../networking/terraform.tfstate"
    }
}

# Application Load Balancer
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
        path                = "/health"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 5
        unhealthy_threshold = 2
    }

    tags = {
        Name        = "${var.project_name}-Backend-Target-Group"
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

    tags = {
        Name        = "${var.project_name}-Backend-Listener"
        Project     = var.project_name
        Environment = var.environment
    }
}

# Launch Template for Backend
resource "aws_launch_template" "backend_launch_template" {
    name_prefix   = "${var.project_name}-backend-"
    image_id      = var.ami_id
    instance_type = var.instance_type
    key_name      = var.key_pair_name != "" ? var.key_pair_name : null
    
    vpc_security_group_ids = [data.terraform_remote_state.networking.outputs.backend_security_group_id]

    iam_instance_profile {
        name = aws_iam_instance_profile.ec2_profile.name
    }

    user_data = base64encode(templatefile("${path.module}/user_data.sh", {
        gemini_api_key = var.gemini_api_key
        mongodb_uri    = "mongodb://${aws_instance.mongodb_instance.private_ip}:27017/careervault"
    }))

    tag_specifications {
        resource_type = "instance"
        tags = {
            Name        = "${var.project_name}-Backend-Instance"
            Project     = var.project_name
            Environment = var.environment
            Type        = "Backend"
        }
    }

    lifecycle {
        create_before_destroy = true
    }
}

# Auto Scaling Group
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
        value               = "${var.project_name}-Backend-ASG"
        propagate_at_launch = true
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

# MongoDB Instance (Single instance for simplicity - use DocumentDB for production)
resource "aws_instance" "mongodb_instance" {
    ami                    = var.ami_id
    instance_type          = var.db_instance_type
    key_name               = var.key_pair_name != "" ? var.key_pair_name : null
    subnet_id              = data.terraform_remote_state.networking.outputs.private_subnet_1_id
    vpc_security_group_ids = [data.terraform_remote_state.networking.outputs.database_security_group_id]

    iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

    user_data = base64encode(file("${path.module}/mongodb_user_data.sh"))

    tags = {
        Name        = "${var.project_name}-MongoDB-Instance"
        Project     = var.project_name
        Environment = var.environment
        Type        = "Database"
    }
}

# CloudWatch Log Group for Backend
resource "aws_cloudwatch_log_group" "backend_logs" {
    name              = "/aws/ec2/${var.project_name}/backend"
    retention_in_days = 14

    tags = {
        Name        = "${var.project_name}-Backend-Logs"
        Project     = var.project_name
        Environment = var.environment
    }
}

# CloudWatch Log Group for MongoDB
resource "aws_cloudwatch_log_group" "mongodb_logs" {
    name              = "/aws/ec2/${var.project_name}/mongodb"
    retention_in_days = 14

    tags = {
        Name        = "${var.project_name}-MongoDB-Logs"
        Project     = var.project_name
        Environment = var.environment
    }
}

# IAM Role for EC2 instances
resource "aws_iam_role" "ec2_role" {
    name = "${var.project_name}-ec2-role"

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

# IAM Policy for CloudWatch Logs
resource "aws_iam_policy" "cloudwatch_logs_policy" {
    name        = "${var.project_name}-cloudwatch-logs-policy"
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
                    "logs:DescribeLogStreams",
                    "logs:DescribeLogGroups"
                ]
                Resource = "*"
            }
        ]
    })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "cloudwatch_logs_attachment" {
    role       = aws_iam_role.ec2_role.name
    policy_arn = aws_iam_policy.cloudwatch_logs_policy.arn
}

# Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
    name = "${var.project_name}-ec2-profile"
    role = aws_iam_role.ec2_role.name

    tags = {
        Name        = "${var.project_name}-EC2-Profile"
        Project     = var.project_name
        Environment = var.environment
    }
}
