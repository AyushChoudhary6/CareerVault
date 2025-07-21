#!/bin/bash

# ===================================================================
# CareerVault Backend Setup Script - DynamoDB + Simple JWT
# ===================================================================

set -e

# Update system
yum update -y

#!/bin/bash
set -e

# Update system
yum update -y

# Install required packages
yum install -y \
    python3 \
    python3-pip \
    git \
    docker \
    amazon-cloudwatch-agent \
    awscli

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Python dependencies
pip3 install \
    fastapi \
    uvicorn \
    boto3 \
    bcrypt \
    python-jose[cryptography] \
    python-multipart \
    google-generativeai \
    psycopg2-binary

# Create application directory
mkdir -p /opt/careervault
cd /opt/careervault

# Get instance metadata
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Configure AWS CLI with region
aws configure set region $REGION

# Create environment file with secrets from AWS Secrets Manager
cat > .env << EOF
AWS_REGION=$REGION
ENVIRONMENT=${environment}
PROJECT_NAME=${project_name}
INSTANCE_ID=$INSTANCE_ID
EOF

# Create FastAPI application
cat > main.py << 'EOL'
import os
import json
import boto3
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from bcrypt import hashpw, checkpw, gensalt
from datetime import datetime, timedelta
import google.generativeai as genai
from botocore.exceptions import ClientError
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CareerVault API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# AWS clients
secrets_client = boto3.client('secretsmanager')
s3_client = boto3.client('s3')
ssm_client = boto3.client('ssm')
dynamodb = boto3.resource('dynamodb')

# Global configuration
config = {}

def load_config():
    """Load configuration from AWS services"""
    global config
    
    try:
        # Get S3 bucket name from Parameter Store
        bucket_response = ssm_client.get_parameter(
            Name='/${project_name}/config/s3-bucket'
        )
        config['s3_bucket'] = bucket_response['Parameter']['Value']
        
        # Get JWT secret from Secrets Manager
        jwt_response = secrets_client.get_secret_value(
            SecretId='${project_name}/api/jwt-secret'
        )
        config['jwt_secret'] = json.loads(jwt_response['SecretString'])
        
        # Get Gemini API key from Secrets Manager
        gemini_response = secrets_client.get_secret_value(
            SecretId='${project_name}/api/gemini-key'
        )
        config['gemini_api_key'] = gemini_response['SecretString']
        
        # Get database credentials from Secrets Manager
        db_response = secrets_client.get_secret_value(
            SecretId='${project_name}/database/credentials'
        )
        db_creds = json.loads(db_response['SecretString'])
        config['db_credentials'] = db_creds
        
        # Configure Gemini AI
        genai.configure(api_key=config['gemini_api_key'])
        config['gemini_model'] = genai.GenerativeModel('gemini-pro')
        
        # Initialize DynamoDB tables
        config['users_table'] = dynamodb.Table('${project_name}-users')
        config['jobs_table'] = dynamodb.Table('${project_name}-jobs')
        
        logger.info("Configuration loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        raise

# Initialize configuration on startup
@app.on_event("startup")
async def startup_event():
    load_config()

def get_db_connection():
    """Get PostgreSQL database connection"""
    try:
        db_creds = config['db_credentials']
        conn = psycopg2.connect(
            host=db_creds['host'],
            port=db_creds['port'],
            database=db_creds['dbname'],
            user=db_creds['username'],
            password=db_creds['password']
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config['jwt_secret'], algorithm="HS256")
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, config['jwt_secret'], algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return {"message": "CareerVault API is running", "timestamp": datetime.utcnow()}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check DynamoDB connection
        config['users_table'].scan(Limit=1)
        
        # Check S3 connection
        s3_client.head_bucket(Bucket=config['s3_bucket'])
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "services": {
                "dynamodb": "connected",
                "s3": "connected",
                "secrets_manager": "connected"
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )

@app.post("/signup")
async def signup(email: str, password: str, full_name: str):
    """User signup"""
    try:
        # Check if user exists in DynamoDB
        response = config['users_table'].get_item(Key={'email': email})
        if 'Item' in response:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Hash password
        hashed_password = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')
        
        # Create user in DynamoDB
        user_data = {
            'email': email,
            'password': hashed_password,
            'full_name': full_name,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        config['users_table'].put_item(Item=user_data)
        
        # Create access token
        access_token = create_access_token(data={"sub": email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"email": email, "full_name": full_name}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/login")
async def login(email: str, password: str):
    """User login"""
    try:
        # Get user from DynamoDB
        response = config['users_table'].get_item(Key={'email': email})
        if 'Item' not in response:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = response['Item']
        
        # Verify password
        if not checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create access token
        access_token = create_access_token(data={"sub": email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"email": email, "full_name": user['full_name']}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    """Upload resume to S3"""
    try:
        # Validate file type
        if not file.filename.endswith(('.pdf', '.doc', '.docx')):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Upload to S3
        file_key = f"resumes/{current_user}/{file.filename}"
        s3_client.upload_fileobj(
            file.file,
            config['s3_bucket'],
            file_key,
            ExtraArgs={'ContentType': file.content_type}
        )
        
        return {
            "message": "Resume uploaded successfully",
            "file_key": file_key,
            "file_name": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume upload error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/jobs")
async def get_jobs(current_user: str = Depends(get_current_user)):
    """Get user's job applications"""
    try:
        response = config['jobs_table'].query(
            IndexName='user-index',
            KeyConditionExpression='user_email = :user_email',
            ExpressionAttributeValues={':user_email': current_user}
        )
        
        return {"jobs": response['Items']} 
        
    except Exception as e:
        logger.error(f"Get jobs error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/ai/career-advice")
async def get_career_advice(
    query: str,
    current_user: str = Depends(get_current_user)
):
    """Get AI-powered career advice"""
    try:
        prompt = f"As a career advisor, provide helpful advice for: {query}"
        response = config['gemini_model'].generate_content(prompt)
        
        return {"advice": response.text}
        
    except Exception as e:
        logger.error(f"AI advice error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOL

# Create systemd service
cat > /etc/systemd/system/careervault.service << EOF
[Unit]
Description=CareerVault FastAPI Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/careervault
ExecStart=/usr/bin/python3 /opt/careervault/main.py
Restart=always
RestartSec=5
Environment=PATH=/usr/bin
EnvironmentFile=/opt/careervault/.env

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R ec2-user:ec2-user /opt/careervault
chmod +x /opt/careervault/main.py

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/ec2/${project_name}/backend",
                        "log_stream_name": "{instance_id}/messages"
                    },
                    {
                        "file_path": "/var/log/cloud-init.log",
                        "log_group_name": "/aws/ec2/${project_name}/backend",
                        "log_stream_name": "{instance_id}/cloud-init"
                    }
                ]
            }
        },
        "metrics": {
            "namespace": "CareerVault/EC2",
            "metrics_collected": {
                "cpu": {
                    "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                    "metrics_collection_interval": 60
                },
                "disk": {
                    "measurement": ["used_percent"],
                    "metrics_collection_interval": 60,
                    "resources": ["*"]
                },
                "mem": {
                    "measurement": ["mem_used_percent"],
                    "metrics_collection_interval": 60
                }
            }
        }
    }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s

# Enable and start the service
systemctl daemon-reload
systemctl enable careervault
systemctl start careervault

# Log completion
echo "CareerVault backend setup completed at $(date)" >> /var/log/setup.log

# Start and enable Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install CloudWatch agent
yum install -y amazon-cloudwatch-agent

# Create application directory
mkdir -p /opt/careervault
cd /opt/careervault

# Clone your repository or copy application files
# For now, create a simple FastAPI app structure
mkdir -p app/{routes,utils,models}

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
boto3==1.34.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
google-generativeai==0.3.2
pydantic[email]==2.5.0
python-dotenv==1.0.0
EOF

# Install Python dependencies
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Create main application file
cat > app/main.py << 'EOF'
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
import boto3
import uuid
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
AWS_REGION = "${aws_region}"
USERS_TABLE = "${users_table_name}"
JOBS_TABLE = "${jobs_table_name}"

# Initialize FastAPI
app = FastAPI(title="CareerVault API", version="2.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# AWS DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
users_table = dynamodb.Table(USERS_TABLE)
jobs_table = dynamodb.Table(JOBS_TABLE)

# Pydantic Models
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class JobCreate(BaseModel):
    company: str
    position: str
    status: str = "Applied"
    applied_date: str
    application_link: Optional[str] = None
    notes: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    company: str
    position: str
    status: str
    applied_date: str
    application_link: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.get("/")
def root():
    return {"message": "CareerVault API", "version": "2.0.0", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/auth/signup")
def signup(user: UserSignup):
    try:
        # Check if user exists
        response = users_table.get_item(Key={"email": user.email})
        if "Item" in response:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(user.password)
        
        users_table.put_item(
            Item={
                "id": user_id,
                "username": user.username,
                "email": user.email,
                "hashed_password": hashed_password,
                "created_at": datetime.utcnow().isoformat(),
                "is_active": True
            }
        )
        
        return {"message": "User created successfully", "user_id": user_id}
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin):
    try:
        # Get user by email using GSI
        response = users_table.query(
            IndexName="EmailIndex",
            KeyConditionExpression="email = :email",
            ExpressionAttributeValues={":email": user.email}
        )
        
        if not response["Items"]:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        db_user = response["Items"][0]
        
        if not verify_password(user.password, db_user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create token
        access_token = create_access_token(data={"user_id": db_user["id"], "email": db_user["email"]})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/auth/me")
def get_current_user_info(current_user_id: str = Depends(get_current_user_id)):
    try:
        response = users_table.get_item(Key={"id": current_user_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = response["Item"]
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/jobs", response_model=JobResponse)
def create_job(job: JobCreate, current_user_id: str = Depends(get_current_user_id)):
    try:
        job_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        jobs_table.put_item(
            Item={
                "id": job_id,
                "user_id": current_user_id,
                "company": job.company,
                "position": job.position,
                "status": job.status,
                "applied_date": job.applied_date,
                "application_link": job.application_link,
                "notes": job.notes,
                "created_at": timestamp,
                "updated_at": timestamp
            }
        )
        
        return JobResponse(
            id=job_id,
            company=job.company,
            position=job.position,
            status=job.status,
            applied_date=job.applied_date,
            application_link=job.application_link,
            notes=job.notes,
            created_at=timestamp,
            updated_at=timestamp
        )
    except Exception as e:
        logger.error(f"Create job error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/jobs", response_model=List[JobResponse])
def get_jobs(current_user_id: str = Depends(get_current_user_id)):
    try:
        response = jobs_table.query(
            IndexName="UserJobsIndex",
            KeyConditionExpression="user_id = :user_id",
            ExpressionAttributeValues={":user_id": current_user_id}
        )
        
        jobs = []
        for item in response["Items"]:
            jobs.append(JobResponse(
                id=item["id"],
                company=item["company"],
                position=item["position"],
                status=item["status"],
                applied_date=item["applied_date"],
                application_link=item.get("application_link"),
                notes=item.get("notes"),
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            ))
        
        return jobs
    except Exception as e:
        logger.error(f"Get jobs error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Set environment variables
echo "export AWS_REGION=${aws_region}" >> /etc/environment
echo "export GEMINI_API_KEY=${gemini_api_key}" >> /etc/environment
echo "export USERS_TABLE=${users_table_name}" >> /etc/environment
echo "export JOBS_TABLE=${jobs_table_name}" >> /etc/environment
echo "export JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production" >> /etc/environment

# Create systemd service
cat > /etc/systemd/system/careervault.service << 'EOF'
[Unit]
Description=CareerVault FastAPI Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/careervault
Environment=PATH=/usr/local/bin:/usr/bin:/bin
Environment=PYTHONPATH=/opt/careervault
EnvironmentFile=/etc/environment
ExecStart=/usr/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start and enable the service
systemctl daemon-reload
systemctl enable careervault
systemctl start careervault

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/ec2/${project_name}/backend",
                        "log_stream_name": "{instance_id}/var/log/messages"
                    },
                    {
                        "file_path": "/var/log/careervault.log",
                        "log_group_name": "/aws/ec2/${project_name}/backend",
                        "log_stream_name": "{instance_id}/careervault"
                    }
                ]
            }
        }
    }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s

# Set permissions
chown -R ec2-user:ec2-user /opt/careervault

# Log completion
echo "$(date): CareerVault backend setup completed successfully" >> /var/log/careervault-setup.log
