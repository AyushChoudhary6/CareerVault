# 🚀 Quick Setup Checklist for CareerVault DynamoDB + Cognito

## ⚡ Essential Manual Setup (5 Main Steps)

### Step 1: AWS Account & IAM User
```bash
1. Create AWS account at aws.amazon.com
2. Create IAM user: aws iam create-user --user-name careervault-app-user
3. Create access keys: aws iam create-access-key --user-name careervault-app-user
4. Save AccessKeyId and SecretAccessKey for .env file
```

### Step 2: Create DynamoDB Tables
```bash
# Jobs Table
aws dynamodb create-table --table-name CareerVault-Jobs \
    --attribute-definitions AttributeName=user_id,AttributeType=S AttributeName=job_id,AttributeType=S \
    --key-schema AttributeName=user_id,KeyType=HASH AttributeName=job_id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST --region us-east-2

# Users Table  
aws dynamodb create-table --table-name CareerVault-Users \
    --attribute-definitions AttributeName=user_id,AttributeType=S \
    --key-schema AttributeName=user_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST --region us-east-2
```

### Step 3: Create Cognito User Pool
```bash
# Create User Pool
aws cognito-idp create-user-pool --pool-name CareerVault-Users \
    --auto-verified-attributes email --username-attributes email --region us-east-2

# Create App Client (use UserPoolId from above)
aws cognito-idp create-user-pool-client --user-pool-id YOUR_USER_POOL_ID \
    --client-name CareerVault-Backend --explicit-auth-flows ADMIN_NO_SRP_AUTH --region us-east-2
```

### Step 4: Get Google Gemini API Key
```bash
1. Go to console.cloud.google.com
2. Create project or select existing
3. Enable "Generative AI API"
4. Go to Credentials → Create API Key
5. Save the API key
```

### Step 5: Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your values:
```

```bash
AWS_ACCESS_KEY_ID=your_access_key_from_step_1
AWS_SECRET_ACCESS_KEY=your_secret_key_from_step_1
AWS_DEFAULT_REGION=us-east-2
COGNITO_USER_POOL_ID=your_user_pool_id_from_step_3
COGNITO_CLIENT_ID=your_client_id_from_step_3
GEMINI_API_KEY=your_gemini_key_from_step_4
```

## ✅ Test Everything Works

```bash
# 1. Start backend
cd backend
python main_dynamodb.py

# 2. Check health (in another terminal)
curl http://localhost:8000/health

# 3. Test user signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!"}'
```

## 🔍 What Each Service ID Looks Like

| Service | Example Format | Where to Find |
|---------|----------------|---------------|
| **AWS Access Key** | `AKIA...` (20 chars) | IAM Console → Users → Security Credentials |
| **AWS Secret Key** | `wJalrXUt...` (40 chars) | Same as above (only shown once) |
| **User Pool ID** | `us-east-2_AbCdEfGhI` | Cognito Console → User Pools |
| **Client ID** | `1234567890abcdefghij` | User Pool → App Integration → App Clients |
| **Gemini API Key** | `AIzaSy...` | Google Cloud Console → APIs → Credentials |

## 🆘 If Something Doesn't Work

### "Unable to locate credentials"
```bash
aws configure
# Enter your access key, secret key, region (us-east-2), format (json)
```

### "ResourceNotFoundException" for DynamoDB
```bash
aws dynamodb list-tables --region us-east-2
# Verify tables exist, create if missing
```

### "InvalidUserPoolConfiguration" for Cognito
```bash
aws cognito-idp describe-user-pool --user-pool-id YOUR_ID --region us-east-2
# Verify user pool exists and auth flows are correct
```

### "Invalid API key" for Gemini
- Check API key is correct in .env
- Verify Generative AI API is enabled in Google Cloud

## 🎯 Expected Results

**Successful startup should show:**
```
✅ Connected to DynamoDB in region us-east-2
✅ Cognito connection established
✅ CareerVault API startup complete!
```

**Health check should return:**
```json
{
  "status": "healthy",
  "services": {
    "dynamodb": {"status": "healthy"},
    "cognito": {"status": "healthy"},
    "gemini_ai": {"status": "configured"}
  }
}
```

---

**🎉 Once all green checkmarks appear, your CareerVault is ready to use with DynamoDB + Cognito!**
