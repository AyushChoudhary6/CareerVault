variable "aws_region" {
    description = "AWS Region to deploy resources"
    type        = string
    default     = "us-east-2"
}

variable "project_name" {
    description = "Project name for tagging resources"
    type        = string
    default     = "CareerVault"
}

variable "environment" {
    description = "Environment (e.g., production, staging, development)"
    type        = string
    default     = "production"
}

variable "ami_id" {
    description = "AMI ID for EC2 instances (Amazon Linux 2)"
    type        = string
    default     = "ami-0c02fb55956c7d316" # Amazon Linux 2 AMI (HVM) - us-east-2
}

variable "instance_type" {
    description = "Instance type for backend servers"
    type        = string
    default     = "t3.medium"
}

variable "db_instance_type" {
    description = "Instance type for MongoDB database"
    type        = string
    default     = "t3.small"
}

variable "min_size" {
    description = "Minimum number of instances in Auto Scaling Group"
    type        = number
    default     = 1
}

variable "max_size" {
    description = "Maximum number of instances in Auto Scaling Group"
    type        = number
    default     = 3
}

variable "desired_capacity" {
    description = "Desired number of instances in Auto Scaling Group"
    type        = number
    default     = 2
}

variable "gemini_api_key" {
    description = "Google Gemini API Key for AI features"
    type        = string
    sensitive   = true
}

variable "key_pair_name" {
    description = "EC2 Key Pair name for SSH access"
    type        = string
    default     = ""
}
