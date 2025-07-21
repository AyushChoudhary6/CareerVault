# CareerVault AWS Infrastructure Deployment Guide

## Overview
This guide covers the deployment of a comprehensive AWS infrastructure for CareerVault, including all requested services while maintaining simple JWT authentication (no AWS Cognito).

## Architecture Components

### Core Services
- **VPC & Networking**: Custom VPC with public/private subnets, NAT Gateway, Internet Gateway
- **EC2 Auto Scaling**: Auto-scaling backend servers with Application Load Balancer
- **DynamoDB**: NoSQL database for users and job applications
- **RDS PostgreSQL**: Relational database (alternative to DynamoDB)
- **S3**: File storage for resumes and documents
- **Secrets Manager**: Secure storage for API keys and database credentials
- **Systems Manager Parameter Store**: Configuration management
- **CloudWatch**: Monitoring, logging, and alerting
- **CloudTrail**: Security auditing and compliance
- **IAM**: Fine-grained access control

### Features
- Simple JWT authentication (no AWS Cognito complexity)
- Auto-scaling backend with health checks
- Secure secret management
- Comprehensive monitoring and alerting
- File upload capabilities
- AI-powered career advice using Gemini API

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Terraform installed** (version >= 1.0)
3. **Gemini API Key** for AI features
4. **EC2 Key Pair** (optional, for SSH access)

## Infrastructure Deployment

### Step 1: Deploy Networking Infrastructure

```powershell
# Navigate to networking directory
cd "c:\personal\Old_Drive things\projects\job tracker app\infra\terraform\networking"

# Initialize Terraform
terraform init

# Create terraform.tfvars file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your configuration

# Plan and apply
terraform plan
terraform apply
```

### Step 2: Deploy Backend Infrastructure

```powershell
# Navigate to backend directory
cd "c:\personal\Old_Drive things\projects\job tracker app\infra\terraform\backend"

# Initialize Terraform
terraform init

# Create terraform.tfvars file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your configuration

# Set Gemini API key as environment variable
$env:TF_VAR_gemini_api_key = "your-gemini-api-key-here"

# Plan and apply
terraform plan
terraform apply
```

## Configuration

### terraform.tfvars Configuration

```hcl
# Basic Configuration
project_name = "CareerVault"
environment  = "production"
aws_region   = "ap-south-1"

# EC2 Configuration
instance_type    = "t3.small"
min_size         = 1
max_size         = 3
desired_capacity = 2

# RDS Configuration
db_instance_class = "db.t3.micro"

# Security
key_name = "your-ec2-key-pair"  # Optional for SSH access
```

### Environment Variables

```powershell
# Set Gemini API key
$env:TF_VAR_gemini_api_key = "your-gemini-api-key-here"

# Optional: Override other variables
$env:TF_VAR_project_name = "CareerVault"
$env:TF_VAR_environment = "production"
```

## Post-Deployment Configuration

### 1. Verify Deployment

```powershell
# Check infrastructure status
terraform output

# Test API endpoint
$api_url = terraform output -raw api_base_url
Invoke-RestMethod -Uri "$api_url/health" -Method GET
```

### 2. Configure DNS (Optional)

If you want to use a custom domain:

1. Create Route 53 hosted zone
2. Point your domain to the ALB DNS name
3. Configure SSL certificate via AWS Certificate Manager

### 3. Set Up Monitoring

The infrastructure includes:
- CloudWatch Dashboard at: `https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#dashboards`
- CloudWatch Alarms for high CPU usage and response time
- CloudTrail for security auditing

### 4. SNS Notifications (Optional)

Subscribe to the SNS topic for alerts:

```powershell
aws sns subscribe \
    --topic-arn "$(terraform output -raw sns_topic_arn)" \
    --protocol email \
    --notification-endpoint your-email@example.com
```

## Database Options

The infrastructure provides both DynamoDB and RDS PostgreSQL:

### DynamoDB (Default)
- Serverless, fully managed
- Automatic scaling
- Pay-per-use pricing
- Used by default in the application

### RDS PostgreSQL (Alternative)
- Traditional relational database
- Requires schema management
- Suitable for complex queries
- To use: Update application configuration

## Security Features

### Secrets Management
- Database credentials stored in AWS Secrets Manager
- JWT secrets auto-generated and stored securely
- Gemini API key stored in Secrets Manager

### Network Security
- Private subnets for backend servers
- Security groups with minimal required access
- NAT Gateway for outbound internet access
- No direct internet access to backend servers

### Audit & Compliance
- CloudTrail logging all API calls
- VPC Flow Logs (can be enabled)
- CloudWatch monitoring and alerting

## Cost Optimization

### Development Environment
```hcl
instance_type = "t3.micro"
min_size = 1
max_size = 2
desired_capacity = 1
db_instance_class = "db.t3.micro"
```

### Production Environment
```hcl
instance_type = "t3.medium"
min_size = 2
max_size = 6
desired_capacity = 3
db_instance_class = "db.t3.small"
```

## Troubleshooting

### Common Issues

1. **Insufficient Permissions**
   ```powershell
   # Ensure your AWS user has required permissions
   aws sts get-caller-identity
   ```

2. **AMI Not Found**
   ```hcl
   # Update AMI ID in variables for your region
   ami_id = "ami-0c2af51e265bd5e0e"  # Amazon Linux 2 ap-south-1
   ```

3. **API Not Accessible**
   ```powershell
   # Check security groups and ALB target health
   aws elbv2 describe-target-health --target-group-arn "$(terraform output -raw alb_target_group_arn)"
   ```

### Logs and Monitoring

```powershell
# View CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/ec2/CareerVault"

# Check EC2 instance health
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names "$(terraform output -raw autoscaling_group_name)"
```

## Cleanup

To destroy the infrastructure:

```powershell
# Destroy backend infrastructure
cd "c:\personal\Old_Drive things\projects\job tracker app\infra\terraform\backend"
terraform destroy

# Destroy networking infrastructure
cd "c:\personal\Old_Drive things\projects\job tracker app\infra\terraform\networking"
terraform destroy
```

## API Usage

### Authentication Endpoints

```powershell
# Sign up
$response = Invoke-RestMethod -Uri "$api_url/signup" -Method POST -Body @{
    email = "user@example.com"
    password = "password123"
    full_name = "John Doe"
} -ContentType "application/json"

# Login
$response = Invoke-RestMethod -Uri "$api_url/login" -Method POST -Body @{
    email = "user@example.com"
    password = "password123"
} -ContentType "application/json"

$token = $response.access_token
```

### Protected Endpoints

```powershell
# Get jobs (requires authentication)
$headers = @{ Authorization = "Bearer $token" }
$jobs = Invoke-RestMethod -Uri "$api_url/jobs" -Method GET -Headers $headers

# Upload resume
$headers = @{ Authorization = "Bearer $token" }
# File upload would use multipart/form-data
```

## Monitoring & Maintenance

### Regular Tasks
1. Monitor CloudWatch dashboards
2. Review CloudTrail logs for security
3. Update EC2 AMIs regularly
4. Monitor costs in AWS Cost Explorer
5. Review and rotate secrets periodically

### Scaling
- Auto Scaling Group automatically handles traffic spikes
- DynamoDB scales automatically
- RDS can be scaled manually if needed
- Monitor CloudWatch metrics for performance

## Support

For issues with the infrastructure:
1. Check CloudWatch logs
2. Review Terraform state
3. Check AWS console for resource status
4. Verify security group configurations

The infrastructure is designed to be production-ready with high availability, security, and monitoring capabilities while maintaining cost efficiency.
