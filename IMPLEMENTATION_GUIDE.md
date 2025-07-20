# CareerVault DynamoDB + Cognito Implementation Guide

## 🎯 Overview

This guide covers the implementation of the new CareerVault architecture using:
- **DynamoDB** for data storage (replacing MongoDB)
- **AWS Cognito** for authentication (replacing custom JWT)
- **FastAPI** backend with the new architecture
- **React** frontend updated for Cognito integration

## 📋 What Has Been Implemented

### Backend Changes

#### ✅ New Files Created
- `app/utils/dynamodb_config.py` - DynamoDB connection and table management
- `app/utils/cognito_service.py` - AWS Cognito authentication service
- `app/utils/models_dynamodb.py` - Pydantic models for DynamoDB
- `app/utils/dynamodb_service.py` - Repository pattern for DynamoDB operations
- `app/utils/security_cognito.py` - Security utilities for Cognito authentication
- `app/routes/auth_cognito.py` - Authentication routes using Cognito
- `app/routes/jobs_dynamodb.py` - Job management routes using DynamoDB
- `main_dynamodb.py` - New main application file

#### ✅ Configuration Updates
- `requirements.txt` - Updated with AWS dependencies (boto3, PyJWT, etc.)
- `.env.example` - Configuration template for AWS services

### Frontend Changes

#### ✅ Updated Files
- `src/services/api.js` - Updated for Cognito authentication and new API endpoints
- `src/context/AuthContext_cognito.jsx` - New auth context for Cognito

#### ✅ New Features
- Automatic token refresh
- Cognito token storage (access, ID, refresh tokens)
- Enhanced error handling for AWS services
- Bulk operations for job management

### Infrastructure

#### ✅ Database Schema
- **Jobs Table**: `CareerVault-Jobs` with user_id and job_id as keys
- **Users Table**: `CareerVault-Users` for user metadata
- **Global Secondary Indexes**: For status-based queries

#### ✅ Authentication Flow
- Cognito User Pool registration
- Server-side authentication with admin APIs
- JWT token verification with Cognito public keys
- Automatic token refresh handling

## 🛠️ Setup Instructions

### Step 1: AWS Setup

#### 1.1 Create DynamoDB Tables

**Option A: Using AWS Console**
1. Go to AWS DynamoDB console
2. Create table `CareerVault-Jobs`:
   - Partition key: `user_id` (String)
   - Sort key: `job_id` (String)
   - Create GSI: `status-created_at-index`
     - Partition key: `status` (String)
     - Sort key: `created_at` (String)

3. Create table `CareerVault-Users`:
   - Partition key: `user_id` (String)
   - Create GSI: `email-index`
     - Partition key: `email` (String)

**Option B: Using AWS CLI**
```bash
# Create Jobs table
aws dynamodb create-table \
    --table-name CareerVault-Jobs \
    --attribute-definitions \
        AttributeName=user_id,AttributeType=S \
        AttributeName=job_id,AttributeType=S \
        AttributeName=status,AttributeType=S \
        AttributeName=created_at,AttributeType=S \
    --key-schema \
        AttributeName=user_id,KeyType=HASH \
        AttributeName=job_id,KeyType=RANGE \
    --global-secondary-indexes \
        IndexName=status-created_at-index,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=created_at,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST \
    --billing-mode PAY_PER_REQUEST

# Create Users table
aws dynamodb create-table \
    --table-name CareerVault-Users \
    --attribute-definitions \
        AttributeName=user_id,AttributeType=S \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=user_id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST \
    --billing-mode PAY_PER_REQUEST
```

#### 1.2 Create Cognito User Pool

**Using AWS Console:**
1. Go to AWS Cognito console
2. Create User Pool with these settings:
   - **Sign-in options**: Username, Email
   - **Password policy**: Default (8+ chars, mixed case, numbers, symbols)
   - **MFA**: Optional (can enable later)
   - **App client**: 
     - Client type: Public client
     - Auth flows: ADMIN_NO_SRP_AUTH (for server-side auth)

**Using AWS CLI:**
```bash
# Create User Pool
aws cognito-idp create-user-pool \
    --pool-name CareerVault-Users \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": true
        }
    }' \
    --auto-verified-attributes email \
    --username-attributes email

# Create App Client
aws cognito-idp create-user-pool-client \
    --user-pool-id YOUR_USER_POOL_ID \
    --client-name CareerVault-Backend \
    --explicit-auth-flows ADMIN_NO_SRP_AUTH \
    --prevent-user-existence-errors ENABLED
```

#### 1.3 Configure IAM User/Role

Create an IAM user with these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:DescribeTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/CareerVault-Jobs",
                "arn:aws:dynamodb:*:*:table/CareerVault-Jobs/index/*",
                "arn:aws:dynamodb:*:*:table/CareerVault-Users",
                "arn:aws:dynamodb:*:*:table/CareerVault-Users/index/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminSetUserPassword",
                "cognito-idp:AdminInitiateAuth",
                "cognito-idp:GetUser",
                "cognito-idp:DescribeUserPool"
            ],
            "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
        }
    ]
}
```

### Step 2: Backend Configuration

#### 2.1 Environment Setup
```bash
cd backend
cp .env.example .env
```

#### 2.2 Update .env file
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_DEFAULT_REGION=us-east-2

# DynamoDB Tables
DYNAMODB_JOBS_TABLE=CareerVault-Jobs
DYNAMODB_USERS_TABLE=CareerVault-Users

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=us-east-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
# COGNITO_CLIENT_SECRET=optional_for_public_clients

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 2.3 Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2.4 Start Backend
```bash
python main_dynamodb.py
```

### Step 3: Frontend Configuration

#### 3.1 Update API Service
The frontend has been updated to work with Cognito. Key changes:
- Token storage: Uses `cognitoAccessToken`, `cognitoIdToken`, `cognitoRefreshToken`
- Automatic token refresh
- Enhanced error handling

#### 3.2 Update AuthContext (Optional)
Replace the current AuthContext with the new Cognito version:
```bash
cd vite-project/src/context
mv AuthContext.jsx AuthContext_old.jsx
mv AuthContext_cognito.jsx AuthContext.jsx
```

#### 3.3 Start Frontend
```bash
cd vite-project
npm install
npm run dev
```

## 🧪 Testing the Implementation

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
    "status": "healthy",
    "timestamp": "2025-07-20T...",
    "version": "2.0.0",
    "services": {
        "dynamodb": {"status": "healthy"},
        "cognito": {"status": "healthy"},
        "gemini_ai": {"status": "configured"}
    }
}
```

### 2. User Registration
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "given_name": "Test",
    "family_name": "User"
  }'
```

### 3. User Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

### 4. Create Job (with token)
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "company": "Google",
    "position": "Software Engineer",
    "status": "Applied",
    "location": "Mountain View, CA",
    "salary_range": "$120k-$180k"
  }'
```

## 🔧 Troubleshooting

### Common Issues

#### 1. DynamoDB Connection Errors
- Verify AWS credentials are correct
- Check table names match environment variables
- Ensure tables exist in the correct region

#### 2. Cognito Authentication Errors
- Verify User Pool ID and Client ID are correct
- Check that ADMIN_NO_SRP_AUTH flow is enabled
- Ensure password meets Cognito policy requirements

#### 3. Token Refresh Issues
- Check token expiration handling in frontend
- Verify refresh token storage and retrieval
- Monitor browser console for authentication errors

### Debug Mode
Set environment variable for detailed logging:
```bash
export DEBUG=true
export LOG_LEVEL=debug
```

## 📊 Migration from MongoDB

### Data Migration Script (if needed)
If you have existing MongoDB data, create a migration script:

```python
# migration_script.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import boto3
from datetime import datetime

async def migrate_jobs():
    # MongoDB connection
    mongo_client = AsyncIOMotorClient("your_mongodb_url")
    mongo_db = mongo_client["job_tracker"]
    jobs_collection = mongo_db["jobs"]
    
    # DynamoDB connection
    dynamodb = boto3.resource('dynamodb', region_name='us-east-2')
    jobs_table = dynamodb.Table('CareerVault-Jobs')
    
    # Migrate jobs
    async for job in jobs_collection.find():
        job_item = {
            'user_id': str(job['user_id']),
            'job_id': str(job['_id']),
            'company': job['company'],
            'position': job['position'],
            'status': job['status'],
            'applied_date': job['applied_date'].isoformat(),
            'created_at': job['created_at'].isoformat(),
            'updated_at': job['updated_at'].isoformat(),
            'sk': 'JOB'
        }
        
        jobs_table.put_item(Item=job_item)
        print(f"Migrated job: {job['company']} - {job['position']}")

if __name__ == "__main__":
    asyncio.run(migrate_jobs())
```

## 🎉 Next Steps

1. **Test all functionality** with the new architecture
2. **Update any remaining frontend components** to use the new AuthContext
3. **Configure production AWS resources** with proper security
4. **Set up monitoring** with CloudWatch
5. **Implement CI/CD pipeline** for deployment
6. **Add additional features** like email notifications, analytics, etc.

## 🔗 Useful Resources

- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS Cognito User Pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

---

**🚀 Your CareerVault application is now running on a modern, scalable architecture with DynamoDB and AWS Cognito!**
