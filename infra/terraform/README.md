# CareerVault Infrastructure

This directory contains Terraform configurations to deploy CareerVault application infrastructure on AWS.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │    Networking   │    │     Backend     │
│   (S3 + CDN)    │    │  (VPC + Subnets)│    │ (ALB + EC2 + DB)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components:

1. **Networking** (`networking/`)
   - VPC with public and private subnets
   - Internet Gateway and NAT Gateways
   - Security Groups for ALB, Backend, and Database
   - Route tables and associations

2. **Backend** (`backend/`)
   - Application Load Balancer (ALB)
   - Auto Scaling Group with EC2 instances
   - MongoDB database instance
   - CloudWatch logging and monitoring
   - IAM roles and policies

3. **Frontend** (`frontend/`)
   - S3 bucket for static website hosting
   - Optional CloudFront CDN
   - Public access configuration

## Prerequisites

1. **AWS CLI configured** with appropriate credentials
2. **Terraform installed** (version >= 1.0)
3. **Gemini API Key** for AI features
4. **EC2 Key Pair** (optional, for SSH access)

## Deployment Order

Deploy in this specific order due to dependencies:

### 1. Deploy Networking Infrastructure

```bash
cd networking/
terraform init
terraform plan -var-file="networking.tfvars"
terraform apply -var-file="networking.tfvars"
```

### 2. Deploy Backend Infrastructure

```bash
cd ../backend/
terraform init

# Edit backend.tfvars and add your Gemini API key
# gemini_api_key = "your-actual-gemini-api-key"

terraform plan -var-file="backend.tfvars"
terraform apply -var-file="backend.tfvars"
```

### 3. Deploy Frontend Infrastructure

```bash
cd ../frontend/
terraform init
terraform plan -var-file="frontend.tfvars"
terraform apply -var-file="frontend.tfvars"

# Build and upload frontend
cd ../../../vite-project/
npm run build
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

## Configuration Files

### Networking (`networking.tfvars`)
```hcl
aws_region                = "us-east-2"
project_name              = "CareerVault"
environment               = "production"
vpc_cidr                  = "10.0.0.0/16"
public_subnet_1_cidr      = "10.0.1.0/24"
public_subnet_2_cidr      = "10.0.2.0/24"
private_subnet_1_cidr     = "10.0.10.0/24"
private_subnet_2_cidr     = "10.0.20.0/24"
```

### Backend (`backend.tfvars`)
```hcl
aws_region        = "us-east-2"
project_name      = "CareerVault"
environment       = "production"
instance_type     = "t3.medium"
db_instance_type  = "t3.small"
min_size          = 1
max_size          = 3
desired_capacity  = 2
gemini_api_key    = "your-gemini-api-key-here"  # Replace with actual key
```

### Frontend (`frontend.tfvars`)
```hcl
aws_region           = "us-east-2"
frontend_bucket_name = "careervault-frontend-bucket-12345"
project_name         = "CareerVault"
environment          = "production"
```

## Important Notes

### Security Considerations

1. **Gemini API Key**: Store securely, never commit to version control
2. **Private Subnets**: Backend and database are in private subnets
3. **Security Groups**: Minimal required access configured
4. **SSH Access**: Optional, only from within VPC

### Cost Optimization

1. **Instance Types**: Start with smaller instances (`t3.small`/`t3.medium`)
2. **Auto Scaling**: Configured for 1-3 instances based on load
3. **NAT Gateways**: Consider single NAT Gateway for cost savings in dev/test
4. **CloudWatch**: 14-day log retention to manage costs

### Production Recommendations

1. **Database**: Replace single MongoDB instance with DocumentDB cluster
2. **SSL/TLS**: Add ACM certificate and configure HTTPS
3. **Domain**: Configure Route53 for custom domain
4. **Monitoring**: Add CloudWatch alarms and SNS notifications
5. **Backup**: Implement automated backup strategies
6. **CI/CD**: Set up deployment pipeline

## Outputs

After deployment, you'll get:

- **ALB DNS Name**: For backend API access
- **S3 Website URL**: For frontend access
- **MongoDB Private IP**: For database connection
- **CloudWatch Log Groups**: For monitoring

## Cleanup

To destroy all resources (in reverse order):

```bash
# 1. Empty S3 bucket first
aws s3 rm s3://your-bucket-name/ --recursive

# 2. Destroy frontend
cd frontend/
terraform destroy -var-file="frontend.tfvars" -auto-approve

# 3. Destroy backend
cd ../backend/
terraform destroy -var-file="backend.tfvars" -auto-approve

# 4. Destroy networking
cd ../networking/
terraform destroy -var-file="networking.tfvars" -auto-approve
```

## Troubleshooting

### Common Issues

1. **AMI ID**: Update `ami_id` in `backend.tfvars` for your region
2. **Key Pair**: Create EC2 key pair if SSH access needed
3. **Permissions**: Ensure IAM user has required AWS permissions
4. **Remote State**: Networking state file must exist for backend deployment

### Useful Commands

```bash
# Check infrastructure status
terraform show
terraform state list

# View outputs
terraform output

# Refresh state
terraform refresh -var-file="*.tfvars"

# Plan without applying
terraform plan -var-file="*.tfvars"
```

## Support

For issues or questions:
1. Check AWS CloudWatch logs
2. Review Terraform state and outputs
3. Verify security group and network connectivity
4. Check EC2 instance user data logs in `/var/log/cloud-init-output.log`
