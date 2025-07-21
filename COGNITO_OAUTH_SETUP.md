# Manual AWS Console Setup for Cognito OAuth 2.0

## Create New App Client (Alternative Method)

### 1. In Cognito User Pool Console:
- Go to "App integration" tab
- Click "Create app client"

### 2. App client configuration:
```
App client name: CareerVault-Web-Client
Client secret: Generate a client secret (IMPORTANT!)
Authentication flows:
  ✅ ALLOW_USER_SRP_AUTH
  ✅ ALLOW_REFRESH_TOKEN_AUTH

Hosted UI settings:
  ✅ Use the Cognito Hosted UI
  
Identity providers:
  ✅ Cognito user pool
  
Callback URL(s):
  http://localhost:3000/
  http://localhost:3000/auth
  
Sign out URL(s):
  http://localhost:3000/
  
OAuth 2.0 grant types:
  ✅ Authorization code grant
  
OpenID Connect scopes:
  ✅ OpenID
  ✅ Email
  ✅ Phone
```

### 3. After creating, update your .env file:
```env
COGNITO_CLIENT_ID=new_client_id_here
COGNITO_CLIENT_SECRET=new_client_secret_here
```

### 4. Update main.jsx with new client ID
