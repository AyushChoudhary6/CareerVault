variable "aws_region" {
    description = "AWS Region to deploy resources"
    default = "us-east-2"    
}

variable "frontend_bucket_name"{
    description = "S3 bucket name for frontend hosting"
    type = string
}

variable "project_name"{
    description = "Project name for tagging resources"
    type = string
}

variable "environment"{
    description = "Environment (e.g., production, staging, development)"
    type = string
    default = "production"
}

