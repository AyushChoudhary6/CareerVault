# Manual Setup Requirements for CareerVault DynamoDB + Cognito

## 🚨 Critical Manual Setup Steps

### 1. AWS Account Setup

#### 1.1 Create AWS Account
- Sign up at [AWS Console](https://aws.amazon.com/)
- Verify your email and phone number
- Add payment method (required even for free tier)

#### 1.2 Create IAM User for Application
```bash
# Using AWS CLI (after configuring root credentials)
aws iam create-user --user-name careervault-app-user

# Create access key
aws iam create-access-key --user-name careervault-app-user
```

**Save the output - you'll need these values:**
- `AccessKeyId` → `AWS_ACCESS_KEY_ID`
- `SecretAccessKey` → `AWS_SECRET_ACCESS_KEY`

#### 1.3 Attach IAM Policy
Create and attach this policy to your user:

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
                "dynamodb:DescribeTable",
                "dynamodb:CreateTable",
                "dynamodb:DeleteTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/CareerVault-*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminSetUserPassword",
                "cognito-idp:AdminInitiateAuth",
                "cognito-idp:GetUser",
                "cognito-idp:DescribeUserPool",
                "cognito-idp:CreateUserPool",
                "cognito-idp:CreateUserPoolClient"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. DynamoDB Tables Setup

#### Option A: Automatic (Recommended for Development)
The application will create tables automatically if they don't exist when `ENVIRONMENT=development`.

#### Option B: Manual Creation

**Create Jobs Table:**
```bash
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
    --billing-mode PAY_PER_REQUEST \
    --region us-east-2
```

**Create Users Table:**
```bash
aws dynamodb create-table \
    --table-name CareerVault-Users \
    --attribute-definitions \
        AttributeName=user_id,AttributeType=S \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=user_id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-2
```

### 3. AWS Cognito User Pool Setup

#### 3.1 Create User Pool
```bash
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
    --username-attributes email \
    --region us-east-2
```

**Save the UserPoolId from the output.**

#### 3.2 Create App Client
```bash
aws cognito-idp create-user-pool-client \
    --user-pool-id YOUR_USER_POOL_ID_FROM_STEP_3.1 \
    --client-name CareerVault-Backend \
    --explicit-auth-flows ADMIN_NO_SRP_AUTH \
    --prevent-user-existence-errors ENABLED \
    --region us-east-2
```

**Save the ClientId from the output.**

### 4. Google Gemini AI Setup

#### 4.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Generative AI API

#### 4.2 Get API Key
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Restrict the API key to Generative AI API (recommended)

**Save the API key for your `.env` file.**

### 5. Environment Configuration

#### 5.1 Create .env File
```bash
cd backend
cp .env.example .env
```

#### 5.2 Fill in Required Values
Edit `.env` with your actual values:

```bash
# Environment
ENVIRONMENT=development

# AWS Configuration (from Step 1.2)
AWS_ACCESS_KEY_ID=AKIA...your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_DEFAULT_REGION=us-east-2

# DynamoDB Tables (use these exact names)
DYNAMODB_JOBS_TABLE=CareerVault-Jobs
DYNAMODB_USERS_TABLE=CareerVault-Users

# AWS Cognito Configuration (from Steps 3.1 and 3.2)
COGNITO_USER_POOL_ID=us-east-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini AI Configuration (from Step 4.2)
GEMINI_API_KEY=AIzaSy...your_gemini_key_here

# Application Settings
DEBUG=true
LOG_LEVEL=info
```

## 🧪 Verification Steps

### 1. Test AWS Credentials
```bash
aws sts get-caller-identity
```
Should return your user information.

### 2. Test DynamoDB Access
```bash
aws dynamodb list-tables --region us-east-2
```
Should show your CareerVault tables.

### 3. Test Cognito Access
```bash
aws cognito-idp describe-user-pool --user-pool-id YOUR_USER_POOL_ID --region us-east-2
```
Should return user pool details.

### 4. Test Backend Startup
```bash
cd backend
python main_dynamodb.py
```
Should start without errors and show:
```
✅ Connected to DynamoDB in region us-east-2
✅ Cognito connection established
✅ CareerVault API startup complete!
```

### 5. Test Health Endpoint
```bash
curl http://localhost:8000/health
```
Should return all services as "healthy".

## 🚨 Common Setup Issues

### Issue 1: AWS Credentials Not Working
**Problem:** `Unable to locate credentials`
**Solution:** 
```bash
# Option 1: AWS CLI configure
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=us-east-2

# Option 3: Check .env file is loaded correctly
```

### Issue 2: DynamoDB Tables Not Found
**Problem:** `ResourceNotFoundException`
**Solution:**
1. Check table names match exactly: `CareerVault-Jobs`, `CareerVault-Users`
2. Verify region is `us-east-2`
3. Create tables manually using provided commands

### Issue 3: Cognito Authentication Fails
**Problem:** `InvalidUserPoolConfigurationException`
**Solution:**
1. Ensure ADMIN_NO_SRP_AUTH flow is enabled
2. Check User Pool ID and Client ID are correct
3. Verify IAM permissions include cognito-idp actions

### Issue 4: Gemini API Not Working
**Problem:** `Invalid API key`
**Solution:**
1. Verify API key is correct
2. Enable Generative AI API in Google Cloud Console
3. Check API key restrictions

## 📋 Quick Setup Checklist

- [ ] AWS Account created
- [ ] IAM user created with access keys
- [ ] IAM policy attached to user
- [ ] DynamoDB tables created (or auto-creation enabled)
- [ ] Cognito User Pool created
- [ ] Cognito App Client created with ADMIN_NO_SRP_AUTH
- [ ] Google Cloud project created
- [ ] Generative AI API enabled
- [ ] Gemini API key created
- [ ] `.env` file configured with all values
- [ ] Backend starts without errors
- [ ] Health check returns "healthy" for all services

## 💡 Development vs Production

### Development Setup (Current)
- Uses development environment settings
- Auto-creates tables if missing
- Detailed logging enabled
- Local token storage

### Production Setup (Future)
- Use production IAM roles (not user access keys)
- Enable CloudWatch logging
- Set up proper VPC and security groups
- Use AWS Secrets Manager for sensitive values
- Enable DynamoDB encryption
- Configure Cognito for production domain

## 🆘 Getting Help

If you encounter issues:

1. **Check logs:** The application provides detailed error messages
2. **Verify AWS CLI:** Test individual AWS commands first
3. **Use AWS Console:** Verify resources exist through web interface
4. **Check regions:** Ensure all resources are in the same region (us-east-2)
5. **Test step by step:** Follow the verification steps one by one

---

**Once all these steps are complete, your CareerVault application will be fully functional with DynamoDB and Cognito!**
