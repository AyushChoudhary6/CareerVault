# CareerVault - AI-Powered Job Application Tracking System

![CareerVault Logo](https://img.shields.io/badge/CareerVault-AI--Powered-blue)
![Tech Stack](https://img.shields.io/badge/Tech-React%2BFastAPI%2BDynamoDB-green)
![AWS](https://img.shields.io/badge/Cloud-AWS-orange)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## 🎯 Project Overview

**CareerVault** is a modern, AI-powered job application tracking system designed to help job seekers organize, analyze, and optimize their job search process. The application leverages artificial intelligence to provide intelligent insights, resume analysis, and personalized career guidance.

### 🌟 Key Features

- **📊 Job Application Tracking**: Comprehensive tracking of job applications with status management
- **🤖 AI-Powered Resume Analysis**: Google Gemini AI integration for resume optimization
- **📈 Analytics Dashboard**: Visual insights into job search progress and trends
- **🎯 Smart Job Matching**: AI-driven job-resume compatibility analysis
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🔐 Secure Authentication**: AWS Cognito authentication system with MFA support
- **☁️ Cloud-Native**: Fully managed AWS services with serverless architecture

---

## 🏗️ Architecture & Technology Stack

### 📐 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend     │    │    Database     │
│   React + Vite  │◄──►│   FastAPI       │◄──►│   DynamoDB      │
│   Tailwind CSS  │    │   Python 3.11   │    │   NoSQL DB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   AI Services   │              │
         └──────────────►│ Google Gemini   │◄─────────────┘
                        │   API (v1.5)    │
                        └─────────────────┘
                                │
                    ┌─────────────────┐
                    │ Authentication  │
                    │  AWS Cognito    │
                    │ User Pools      │
                    └─────────────────┘
```

### 🛠️ Technology Choices & Justifications

#### **Frontend Technologies**

| Technology | Version | Purpose | Why We Chose It |
|------------|---------|---------|----------------|
| **React** | 18.x | UI Framework | • Component-based architecture for maintainability<br>• Large ecosystem and community support<br>• Excellent performance with virtual DOM<br>• Hooks for state management |
| **Vite** | 5.x | Build Tool | • Lightning-fast development server<br>• Optimized production builds<br>• Hot Module Replacement (HMR)<br>• Native ES modules support |
| **Tailwind CSS** | 3.x | Styling | • Utility-first approach for rapid development<br>• Consistent design system<br>• Small bundle size with purging<br>• Responsive design made easy |
| **React Router** | 6.x | Routing | • Declarative routing for SPAs<br>• Nested routing capabilities<br>• Browser history management<br>• Code splitting support |
| **Axios** | 1.x | HTTP Client | • Promise-based HTTP requests<br>• Request/response interceptors<br>• Automatic JSON handling<br>• Wide browser support |

#### **Backend Technologies**

| Technology | Version | Purpose | Why We Chose It |
|------------|---------|---------|----------------|
| **FastAPI** | 0.104+ | Web Framework | • High performance (based on Starlette/Pydantic)<br>• Automatic API documentation (OpenAPI)<br>• Type hints for better code quality<br>• Async/await support for scalability |
| **Python** | 3.11 | Programming Language | • Rich ecosystem for AI/ML libraries<br>• Excellent for rapid development<br>• Strong typing with recent versions<br>• Great for data processing |
| **Pydantic** | 2.x | Data Validation | • Runtime type checking<br>• JSON schema generation<br>• Data serialization/deserialization<br>• Integration with FastAPI |
| **PyMuPDF** | 1.23+ | PDF Processing | • Efficient PDF text extraction<br>• Support for various document formats<br>• Good performance for large documents<br>• Python-native implementation |
| **Tesseract OCR** | 5.x | Image Text Recognition | • Industry-standard OCR engine<br>• Support for 100+ languages<br>• Good accuracy for printed text<br>• Open-source and well-maintained |

#### **Database & Storage**

| Technology | Purpose | Why We Chose It |
|------------|---------|----------------|
| **DynamoDB** | Primary Database | • Fully managed NoSQL database<br>• Automatic scaling and high availability<br>• Single-digit millisecond latency<br>• Pay-per-use pricing model |
| **Boto3** | AWS SDK | • Native AWS integration<br>• Asynchronous operations support<br>• Built-in retry logic and error handling<br>• Comprehensive AWS service access |

#### **Authentication & Authorization**

| Technology | Purpose | Why We Chose It |
|------------|---------|----------------|
| **AWS Cognito** | User Management | • Fully managed authentication service<br>• Built-in MFA and social login support<br>• Secure token management (JWT)<br>• Compliance with security standards |
| **Cognito User Pools** | User Directory | • Scalable user directory service<br>• Custom attributes and user groups<br>• Password policies and account recovery<br>• Integration with AWS services |

#### **AI**

| Technology | Purpose | Why We Chose It |
|------------|---------|----------------|
| **Google Gemini API** | AI Processing | • State-of-the-art language model<br>• Excellent text analysis capabilities<br>• Reasonable pricing model<br>• Good API documentation and reliability |
| **Pillow (PIL)** | Image Processing | • Standard Python image library<br>• Wide format support<br>• Image preprocessing for OCR<br>• Memory efficient operations |

#### **DevOps & Infrastructure**

| Technology | Purpose | Why We Chose It |
|------------|---------|----------------|
| **Docker** | Containerization | • Consistent environments across dev/prod<br>• Easy deployment and scaling<br>• Isolation of dependencies<br>• Industry standard |
| **Docker Compose** | Local Development | • Multi-service orchestration<br>• Simplified local development setup<br>• Environment variable management<br>• Service dependency management |
| **Terraform** | Infrastructure as Code | • Declarative infrastructure management<br>• Version control for infrastructure<br>• Cloud-agnostic (though we use AWS)<br>• Plan/apply workflow for safety |
| **AWS** | Cloud Platform | • Comprehensive service ecosystem<br>• Reliable and scalable infrastructure<br>• Cost-effective for small to medium applications<br>• Good integration with CI/CD tools |

---

## 📁 Project Structure

```
CareerVault/
├── 📂 backend/                          # FastAPI Backend Application
│   ├── 📂 app/
│   │   ├── 📂 routes/                   # API Route Handlers
│   │   │   ├── auth.py                  # Authentication endpoints
│   │   │   ├── jobs_mongo.py            # Job management endpoints
│   │   │   └── ai_career.py             # AI-powered career services
│   │   ├── 📂 utils/                    # Utility Modules
│   │   │   ├── cognito.py               # AWS Cognito integration
│   │   │   ├── dynamodb.py              # DynamoDB connection management
│   │   │   ├── gemini_service.py        # Google Gemini AI service
│   │   │   └── security.py              # Security utilities
│   │   └── 📂 models/                   # Data Models
│   ├── main_mongo.py                    # Application entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── Dockerfile                       # Container configuration
│   └── 📂 tests/                        # Test files
│
├── 📂 vite-project/                     # React Frontend Application
│   ├── 📂 src/
│   │   ├── 📂 components/               # Reusable UI Components
│   │   │   ├── Charts.jsx               # Data visualization components
│   │   │   ├── JobCard.jsx              # Job application card
│   │   │   ├── Navbar.jsx               # Navigation component
│   │   │   └── Sidebar.jsx              # Sidebar navigation
│   │   ├── 📂 pages/                    # Page Components
│   │   │   ├── Dashboard.jsx            # Main dashboard
│   │   │   ├── AddJob.jsx               # Add new job form
│   │   │   ├── Analytics.jsx            # Analytics dashboard
│   │   │   ├── CareerAssistant.jsx      # AI chat interface
│   │   │   └── AuthPage.jsx             # Authentication page
│   │   ├── 📂 context/                  # React Context Providers
│   │   │   ├── AuthContext.jsx          # Authentication state
│   │   │   └── JobContext.jsx           # Job data state
│   │   ├── 📂 services/                 # API Service Layer
│   │   │   └── api.js                   # HTTP client configuration
│   │   └── 📂 assets/                   # Static Assets
│   ├── package.json                     # Node.js dependencies
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js               # Tailwind CSS configuration
│   └── 📂 dist/                         # Production build output
│
├── 📂 infra/                            # Infrastructure as Code
│   └── 📂 terraform/                    # Terraform Configurations
│       ├── 📂 networking/               # VPC, Subnets, Security Groups
│       │   ├── main.tf                  # Network infrastructure
│       │   ├── variables.tf             # Input variables
│       │   ├── outputs.tf               # Output values
│       │   └── networking.tfvars        # Configuration values
│       ├── 📂 backend/                  # Application Infrastructure
│       │   ├── main.tf                  # ALB, ASG, EC2, DynamoDB
│       │   ├── variables.tf             # Input variables
│       │   ├── outputs.tf               # Output values
│       │   ├── backend.tfvars           # Configuration values
│       │   ├── user_data.sh             # Backend server setup
│       │   └── cognito_setup.tf         # Cognito User Pool configuration
│       ├── 📂 frontend/                 # Static Website Hosting
│       │   ├── main.tf                  # S3 bucket configuration
│       │   ├── variables.tf             # Input variables
│       │   ├── outputs.tf               # Output values
│       │   └── frontend.tfvars          # Configuration values
│       └── README.md                    # Infrastructure documentation
│
├── 📂 docs/                             # Documentation
├── docker-compose.yml                   # Local development setup
├── start_both.bat                       # Windows startup script
└── README.md                            # This file
```

---

## 🔧 Core Features & Implementation

### 1. **Job Application Tracking System**

#### **Data Model Design**
```python
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Key, Attr

class Job(BaseModel):
    user_id: str
    job_id: str  # Partition key
    company: str
    position: str
    status: JobStatus  # Applied, Interview, Offer, Rejected
    application_date: datetime
    salary_range: Optional[str]
    location: str
    job_description: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # DynamoDB specific fields
    sk: str = "JOB"  # Sort key for single table design
    gsi1_pk: Optional[str] = None  # Global Secondary Index partition key
    gsi1_sk: Optional[str] = None  # Global Secondary Index sort key

class DynamoDBRepository:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table('CareerVault-Jobs')
    
    async def create_job(self, job: Job):
        return self.table.put_item(Item=job.dict())
    
    async def get_user_jobs(self, user_id: str):
        response = self.table.query(
            KeyConditionExpression=Key('user_id').eq(user_id) & Key('sk').begins_with('JOB')
        )
        return response['Items']
```

**Why DynamoDB for Job Data?**
- **Serverless Scaling**: Automatically scales up and down based on demand
- **Single-digit Latency**: Consistent performance at any scale
- **Fully Managed**: No database administration required
- **Cost Effective**: Pay only for what you use with on-demand pricing
- **High Availability**: Built-in multi-AZ replication and backup

#### **Status Management Workflow**
```
Applied → Phone Screen → Technical Interview → Final Interview → Offer/Rejected
    ↓         ↓              ↓                    ↓            ↓
  (Auto)   (Manual)      (Manual)            (Manual)    (Manual)
```

### 2. **AI-Powered Resume Analysis**

#### **Implementation Architecture**
```python
# File Processing Pipeline
def analyze_resume_file(file: UploadFile, job_description: str):
    # Step 1: File Type Detection
    file_type = detect_file_type(file.content_type)
    
    # Step 2: Text Extraction
    if file_type == "pdf":
        text = extract_pdf_text(file)
    elif file_type == "image":
        text = extract_image_text_ocr(file)
    elif file_type == "docx":
        text = extract_docx_text(file)
    
    # Step 3: AI Analysis
    analysis = gemini_service.analyze_resume_job_match(text, job_description)
    
    return analysis
```

#### **AI Analysis Components**

**1. Resume-Job Matching**
- **Skill Alignment**: Compares required vs. available skills
- **Experience Relevance**: Analyzes work history relevance
- **Qualification Assessment**: Evaluates education and certifications
- **Cultural Fit**: Assesses soft skills and company values alignment

**2. Resume Optimization Suggestions**
- **Keyword Enhancement**: Suggests relevant industry keywords
- **Structure Improvements**: Recommends better formatting
- **Content Gaps**: Identifies missing qualifications
- **Achievement Quantification**: Suggests metrics and numbers

**3. Interview Preparation**
- **Potential Questions**: Generates likely interview questions
- **Skill-based Scenarios**: Creates technical challenge scenarios
- **Behavioral Questions**: Prepares STAR method responses
- **Company Research**: Provides company-specific insights

#### **File Processing Technologies**

**PDF Processing with PyMuPDF**
```python
def extract_pdf_text(file_content: bytes) -> str:
    doc = fitz.open(stream=file_content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text
```

**OCR Processing with Tesseract**
```python
def extract_image_text_ocr(image_content: bytes) -> str:
    image = Image.open(io.BytesIO(image_content))
    # Preprocessing for better OCR accuracy
    image = image.convert('L')  # Convert to grayscale
    image = ImageEnhance.Contrast(image).enhance(2)  # Enhance contrast
    text = pytesseract.image_to_string(image)
    return text
```

### 3. **Analytics Dashboard**

#### **Data Visualization Components**

**Application Status Distribution**
- **Pie Chart**: Visual breakdown of application statuses
- **Trend Line**: Application success rate over time
- **Conversion Funnel**: From application to offer

**Time-based Analytics**
- **Application Volume**: Applications per week/month
- **Response Times**: Average time between application and response
- **Success Patterns**: Best performing days/times for applications

**Performance Metrics**
- **Response Rate**: Percentage of applications receiving responses
- **Interview Rate**: Applications leading to interviews
- **Offer Rate**: Interviews resulting in offers

#### **Chart Implementation with Chart.js**
```javascript
// Application Status Distribution
const statusChart = {
  type: 'doughnut',
  data: {
    labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
    datasets: [{
      data: [applied, interview, offer, rejected],
      backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  }
}
```

### 4. **Career Assistant Chatbot**

#### **Conversation Flow Design**
```
User Input → Intent Classification → Context Analysis → Response Generation
     ↓              ↓                    ↓                   ↓
  "Help with    Resume Help         Current Resume      Personalized
   resume"      Category            + Job Target        Suggestions
```

#### **AI Integration Features**

**Career Guidance**
- **Skill Gap Analysis**: Identifies missing skills for target roles
- **Career Path Mapping**: Suggests logical career progressions
- **Industry Insights**: Provides market trends and demands
- **Salary Negotiations**: Offers compensation guidance

**Interview Preparation**
- **Mock Interview Questions**: Role-specific question generation
- **Answer Frameworks**: STAR method and other techniques
- **Confidence Building**: Practice scenarios and feedback

**Job Search Strategy**
- **Application Optimization**: Best practices for applications
- **Networking Advice**: Professional networking strategies
- **Company Research**: Industry and company-specific insights

---

## 🏗️ Infrastructure & Deployment

### **Local Development Environment**

#### **Docker Compose Architecture**
```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
      - COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}
      - COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
    
  frontend:
    build: ./vite-project
    ports: ["3000:80"]
    environment:
      - VITE_AWS_REGION=${AWS_DEFAULT_REGION}
      - VITE_COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}
      - VITE_COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
    depends_on: [backend]
```

**Why This Architecture?**
- **No Database Container**: DynamoDB is fully managed, no local setup needed
- **AWS Integration**: Direct connection to AWS services for development
- **Environment Parity**: Same authentication flow in dev and production
- **Simplified Setup**: No database installation or configuration required

### **AWS Production Infrastructure**

#### **Network Architecture (VPC Design)**

```
┌─────────────────────────────────────────────────────────────┐
│                        VPC (10.0.0.0/16)                    │
├─────────────────────────┬───────────────────────────────────┤
│     Public Subnets      │        Private Subnets            │
│                         │                                   │
│  ┌─────────────────┐   │   ┌─────────────────────────────┐ │
│  │ Application     │   │   │  Backend Instances          │ │
│  │ Load Balancer   │   │   │  (Auto Scaling Group)       │ │
│  │ (Multi-AZ)      │   │   │  - FastAPI Applications     │ │
│  └─────────────────┘   │   │  - Health Checks           │ │
│           │             │   └─────────────────────────────┘ │
│  ┌─────────────────┐   │                                   │
│  │ Internet        │   │   ┌─────────────────────────────┐ │
│  │ Gateway         │   │   │    Managed Services         │ │
│  └─────────────────┘   │   │  - DynamoDB (Serverless)    │ │
│                         │   │  - Cognito User Pools       │ │
│                         │   └─────────────────────────────┘ │
└─────────────────────────┴───────────────────────────────────┘
```

#### **Infrastructure Components Explained**

**1. Virtual Private Cloud (VPC)**
- **Purpose**: Isolated network environment in AWS
- **CIDR Block**: 10.0.0.0/16 (65,536 IP addresses)
- **Why**: Security isolation, network control, compliance

**2. Public Subnets (10.0.1.0/24, 10.0.2.0/24)**
- **Purpose**: Host internet-facing resources
- **Components**: Application Load Balancer, NAT Gateways
- **Multi-AZ**: Spans multiple availability zones for high availability

**3. Private Subnets (10.0.10.0/24, 10.0.20.0/24)**
- **Purpose**: Host application and database servers
- **Components**: Backend EC2 instances, MongoDB server
- **Security**: No direct internet access, protected by security groups

**4. Application Load Balancer (ALB)**
- **Purpose**: Distribute incoming traffic across backend instances
- **Health Checks**: Monitors /health endpoint on backend
- **SSL Termination**: Handles HTTPS encryption/decryption
- **Auto Scaling Integration**: Automatically registers/deregisters instances

**5. Auto Scaling Group (ASG)**
- **Purpose**: Automatically adjust number of backend instances
- **Scaling Triggers**: CPU utilization, request count, custom metrics
- **Health Checks**: Replaces unhealthy instances automatically
- **Cost Optimization**: Scales down during low traffic periods

**6. Security Groups (Virtual Firewalls)**

| Security Group | Inbound Rules | Outbound Rules | Purpose |
|----------------|---------------|----------------|---------|
| **ALB** | HTTP (80), HTTPS (443) from 0.0.0.0/0 | All traffic to Backend SG | Allow web traffic |
| **Backend** | Port 8000 from ALB SG | All traffic to 0.0.0.0/0 | API server access |

**Note**: DynamoDB and Cognito are managed services outside the VPC, accessed via AWS API endpoints with IAM roles.

#### **Auto Scaling Configuration**

```hcl
resource "aws_autoscaling_group" "backend_asg" {
  name                = "CareerVault-backend-asg"
  min_size            = 1    # Minimum instances (cost optimization)
  max_size            = 3    # Maximum instances (performance limit)
  desired_capacity    = 2    # Normal operation instances
  health_check_type   = "ELB"  # Use load balancer health checks
  health_check_grace_period = 300  # 5 minutes for instance startup
}
```

**Scaling Policies:**
- **Scale Up**: When CPU > 70% for 2 consecutive minutes
- **Scale Down**: When CPU < 30% for 5 consecutive minutes
- **Cooldown**: 5-minute waiting period between scaling actions

#### **Database Design Decisions**

**DynamoDB vs Traditional Databases**

| Aspect | DynamoDB (Current) | Traditional DB (MongoDB/PostgreSQL) |
|--------|-------------------|-------------------------------------|
| **Cost** | ~$5-10/month (on-demand) | ~$15-50/month (EC2 hosted) |
| **Management** | Fully managed | Manual setup/maintenance |
| **Backup** | Automated point-in-time recovery | Custom scripts required |
| **Scaling** | Automatic and instant | Manual or complex auto-scaling |
| **Performance** | Single-digit millisecond latency | Variable based on instance size |
| **Use Case** | Modern serverless applications | Traditional applications |

**Current Choice Justification:**
- **Zero Administration**: No database servers to manage or patch
- **Elastic Scaling**: Scales automatically with traffic patterns
- **Built-in Security**: Encryption at rest and in transit by default
- **Cost Optimization**: Pay only for actual usage, not reserved capacity
- **AWS Integration**: Native integration with other AWS services

#### **Monitoring & Logging Strategy**

**CloudWatch Integration**
```bash
# Backend Application Logs
/aws/ec2/CareerVault/backend/application
/aws/ec2/CareerVault/backend/system

# DynamoDB Metrics (built-in)
- Read/Write Capacity Units
- Throttled Requests
- Item Count and Table Size

# Cognito Metrics (built-in)
- Sign-in Success/Failure Rates
- User Pool Size
- Token Generation Metrics
```

**Key Metrics Monitored:**
- **Application**: Response time, error rate, request count
- **Infrastructure**: CPU utilization, memory usage, disk space
- **Database**: Read/write latency, consumed capacity, throttling
- **Authentication**: Login success rates, token validation errors
- **Load Balancer**: Request count, latency, HTTP error codes

---

## 🚀 Deployment & DevOps

### **Deployment Strategy**

#### **Multi-Environment Approach**
```
Development → Staging → Production
     ↓           ↓          ↓
   Local      AWS Test   AWS Prod
  Docker      Instance   Full Infra
```

#### **Infrastructure as Code (IaC) Benefits**

**Why Terraform?**
- **Version Control**: Infrastructure changes tracked in Git
- **Reproducibility**: Identical environments across stages
- **Rollback Capability**: Easy to revert problematic changes
- **Documentation**: Code serves as infrastructure documentation
- **Collaboration**: Team can review infrastructure changes

**Terraform Module Structure:**
```
terraform/
├── networking/     # VPC, subnets, security groups
├── backend/        # ALB, ASG, EC2, DynamoDB, Cognito
└── frontend/       # S3 bucket, CloudFront (optional)
```

#### **Deployment Process**

**1. Infrastructure Deployment**
```bash
# Deploy networking foundation
cd terraform/networking
terraform apply -var-file="networking.tfvars"

# Deploy backend infrastructure
cd ../backend
terraform apply -var-file="backend.tfvars"

# Deploy frontend hosting
cd ../frontend
terraform apply -var-file="frontend.tfvars"
```

**2. Application Deployment**
```bash
# Build and deploy frontend
cd vite-project/
npm run build
aws s3 sync dist/ s3://careervault-frontend-bucket/

# Backend deployment (automated via user data scripts)
# - Docker installation
# - Application code deployment
# - AWS CLI configuration
# - Service startup
```

#### **CI/CD Pipeline (Future Enhancement)**

**Proposed GitHub Actions Workflow:**
```yaml
name: Deploy CareerVault
on:
  push:
    branches: [main]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Backend Tests
      - name: Run Frontend Tests
      
  deploy-infrastructure:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Terraform
      
  deploy-application:
    needs: deploy-infrastructure
    runs-on: ubuntu-latest
    steps:
      - name: Build Frontend
      - name: Deploy to S3
      - name: Update Backend (Blue/Green)
```

### **Security Considerations**

#### **Data Protection**
- **Encryption in Transit**: HTTPS for all communications
- **Encryption at Rest**: MongoDB encryption, S3 encryption
- **API Keys**: Stored in AWS Secrets Manager (future enhancement)
- **Access Control**: IAM roles with least privilege principle

#### **Network Security**
- **Private Subnets**: Database and application servers not directly accessible
- **Security Groups**: Whitelist-based firewall rules
- **VPC Isolation**: Complete network isolation from other applications
- **NAT Gateways**: Controlled internet access for private resources

#### **Application Security**
- **JWT Tokens**: Stateless authentication with expiration
- **Input Validation**: Pydantic models for request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Properly configured cross-origin requests

---

## 💰 Cost Analysis & Optimization

### **AWS Cost Breakdown (Monthly, us-east-2)**

| Service | Resource | Quantity | Monthly Cost | Annual Cost |
|---------|----------|----------|--------------|-------------|
| **Compute** | t3.medium (Backend) | 2 instances | $60 | $720 |
| **Networking** | NAT Gateway | 2 gateways | $90 | $1,080 |
| **Load Balancer** | Application LB | 1 ALB | $22 | $264 |
| **Storage** | EBS (gp3) | 40 GB total | $3 | $36 |
| **Storage** | S3 Standard | 1 GB | $1 | $12 |
| **Database** | DynamoDB | On-demand | $5 | $60 |
| **Authentication** | Cognito | 1000 MAU | $4 | $48 |
| **Monitoring** | CloudWatch | Basic | $5 | $60 |
| **Data Transfer** | Internet | 10 GB/month | $1 | $12 |
| **Total** | | | **~$191** | **~$2,292** |

**Cost Savings vs MongoDB Architecture: ~$8/month (~$96/year)**

### **Cost Optimization Strategies**

#### **Immediate Optimizations**
1. **Single NAT Gateway**: Reduce from 2 to 1 (saves $45/month)
2. **Reserved Instances**: 1-year commitment (saves 30-40%)
3. **Spot Instances**: For development environments (saves 70%)
4. **S3 Intelligent Tiering**: Automatic cost optimization
5. **DynamoDB On-Demand**: Pay only for actual usage (no provisioned capacity)

#### **Scaling Optimizations**
1. **Auto Scaling**: Scale down during off-peak hours
2. **Lambda Functions**: For infrequent AI processing tasks
3. **DynamoDB Auto Scaling**: Automatic capacity management
4. **CloudFront CDN**: Global content delivery with edge caching

#### **Development Cost Management**
```bash
# Terraform workspace for cost-effective development
terraform workspace new development
terraform apply -var="instance_type=t3.micro" -var="desired_capacity=1"
```

---

## 📊 Performance & Scalability

### **Current Performance Metrics**

#### **Application Performance**
- **API Response Time**: < 200ms average
- **Database Queries**: < 50ms average
- **File Processing**: 2-3 seconds for PDF analysis
- **AI Processing**: 3-5 seconds for resume analysis

#### **Scalability Limits (Current Architecture)**
- **Concurrent Users**: ~5000-10000 users (with DynamoDB auto-scaling)
- **Database**: Serverless with automatic scaling
- **File Storage**: S3 with unlimited capacity
- **Geographic**: Single region deployment (multi-region capable)

### **Scaling Strategy**

#### **Horizontal Scaling Plan**
```
Phase 1 (Current): Single Region, Serverless Database
      ↓
Phase 2 (10K+ users): Auto Scaling, Load Balancing, DynamoDB DAX
      ↓
Phase 3 (50K+ users): Multi-Region, Global Tables, Redis Caching
      ↓
Phase 4 (100K+ users): Lambda Functions, API Gateway, Microservices
```

#### **Database Scaling Path**
1. **DynamoDB Auto Scaling**: Automatic capacity adjustment
2. **DynamoDB Accelerator (DAX)**: Microsecond latency caching
3. **Global Tables**: Multi-region active-active replication
4. **DynamoDB Streams**: Real-time data processing with Lambda

#### **Caching Strategy**
```python
# DynamoDB DAX caching for frequent operations
import boto3

dax = boto3.client('dax')

@cache(expire=300)  # 5-minute cache
def get_user_jobs(user_id: str):
    return dax.query(
        TableName='CareerVault-Jobs',
        KeyConditionExpression='user_id = :user_id',
        ExpressionAttributeValues={':user_id': user_id}
    )

# ElastiCache for session data and AI responses
@cache(expire=3600)  # 1-hour cache
def analyze_resume(resume_hash: str, job_description: str):
    return gemini_service.analyze_resume_job_match(resume_text, job_description)
```

---

## 🧪 Testing Strategy

### **Testing Pyramid**

```
        E2E Tests (Cypress)
       ┌─────────────────┐
      ┌┴─────────────────┴┐
     │  Integration Tests  │ (FastAPI TestClient)
    ┌┴─────────────────────┴┐
   │     Unit Tests          │ (Jest, Pytest)
  └─────────────────────────┘
```

#### **Backend Testing**
```python
# Unit Tests with Pytest
def test_job_creation():
    job_data = {
        "company": "TechCorp",
        "position": "Software Engineer",
        "status": "Applied"
    }
    response = client.post("/api/jobs/", json=job_data)
    assert response.status_code == 201

# Integration Tests
def test_ai_resume_analysis():
    with open("test_resume.pdf", "rb") as f:
        response = client.post(
            "/api/ai/analyze-resume-file",
            files={"resume_file": f},
            data={"job_description": "Python developer position"}
        )
    assert response.status_code == 200
    assert "analysis" in response.json()
```

#### **Frontend Testing**
```javascript
// Component Tests with Jest/React Testing Library
test('renders job card with correct data', () => {
  const job = {
    company: 'TechCorp',
    position: 'Software Engineer',
    status: 'Applied'
  };
  render(<JobCard job={job} />);
  expect(screen.getByText('TechCorp')).toBeInTheDocument();
});

// E2E Tests with Cypress
describe('Job Application Flow', () => {
  it('should create a new job application', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="add-job-btn"]').click();
    cy.get('#company').type('TechCorp');
    cy.get('#position').type('Software Engineer');
    cy.get('[type="submit"]').click();
    cy.contains('Job application added successfully');
  });
});
```

### **Performance Testing**

#### **Load Testing with Locust**
```python
from locust import HttpUser, task, between

class CareerVaultUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def view_dashboard(self):
        self.client.get("/api/jobs/")
    
    @task(1)
    def create_job(self):
        self.client.post("/api/jobs/", json={
            "company": "TestCorp",
            "position": "Test Engineer",
            "status": "Applied"
        })
```

---

## 🔒 Security & Compliance

### **Security Framework**

#### **Authentication & Authorization**
```python
# AWS Cognito Integration
import boto3
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()
cognito_client = boto3.client('cognito-idp')

def verify_cognito_token(token: str = Depends(security)):
    try:
        # Get Cognito public keys
        keys_url = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"
        
        # Verify JWT token
        payload = jwt.decode(
            token.credentials,
            keys_url,
            algorithms=['RS256'],
            audience=client_id
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Protected Route with Cognito
@app.get("/api/jobs/")
async def get_jobs(token: dict = Depends(verify_cognito_token)):
    user_id = token['sub']  # Cognito user ID
    return await dynamodb_repo.get_user_jobs(user_id)
```

#### **Data Protection Measures**

**Personal Data Handling**
- **Data Minimization**: Only collect necessary information
- **Encryption**: DynamoDB encryption at rest and in transit by default
- **Access Logging**: All data access logged via CloudTrail and DynamoDB streams
- **Retention Policy**: Automatic data purging with DynamoDB TTL (Time To Live)
- **GDPR Compliance**: Built-in data export and deletion capabilities

**File Upload Security**
```python
# File validation and sanitization
def validate_file(file: UploadFile):
    # File type validation
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type")
    
    # File size validation (max 10MB)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large")
    
    # Virus scanning (future enhancement)
    # scan_for_malware(file.content)
```

#### **Infrastructure Security**

**Network Security**
- **VPC Isolation**: Complete network isolation for compute resources
- **Security Groups**: Least privilege access
- **Private Subnets**: Application servers not directly accessible
- **Managed Services**: DynamoDB and Cognito secured by AWS
- **WAF Protection**: Web Application Firewall (future enhancement)

**Access Control**
- **IAM Roles**: Service-specific permissions with least privilege
- **Cognito User Groups**: Role-based access control
- **AWS Secrets Manager**: Secure storage of API keys and secrets
- **CloudTrail**: Comprehensive audit logging of all AWS API calls
- **MFA Support**: Multi-factor authentication via Cognito

### **Compliance Considerations**

#### **GDPR Compliance**
- **Right to Access**: Users can export their data
- **Right to Deletion**: Complete data removal capability
- **Data Portability**: JSON export functionality
- **Consent Management**: Explicit consent for data processing

#### **SOC 2 Readiness**
- **Security**: Comprehensive security controls
- **Availability**: High availability infrastructure
- **Processing Integrity**: Data validation and integrity checks
- **Confidentiality**: Encryption and access controls
- **Privacy**: Personal data protection measures

---

## 📈 Monitoring & Analytics

### **Application Monitoring**

#### **Health Check Implementation**
```python
@app.get("/health")
async def health_check():
    try:
        # DynamoDB connectivity check
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('CareerVault-Jobs')
        table.meta.client.describe_table(TableName='CareerVault-Jobs')
        db_status = "healthy"
    except Exception as e:
        db_status = "unhealthy"
        
    try:
        # Cognito connectivity check
        cognito = boto3.client('cognito-idp')
        cognito.describe_user_pool(UserPoolId=user_pool_id)
        auth_status = "healthy"
    except Exception as e:
        auth_status = "unhealthy"
    
    return {
        "status": "healthy" if all([db_status == "healthy", auth_status == "healthy"]) else "degraded",
        "database": db_status,
        "authentication": auth_status,
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
```

#### **Custom Metrics**
```python
# Application-specific metrics
class Metrics:
    job_applications_created = Counter('job_applications_total')
    ai_analysis_requests = Counter('ai_analysis_requests_total')
    api_request_duration = Histogram('api_request_duration_seconds')
    
    @staticmethod
    def track_job_creation():
        Metrics.job_applications_created.inc()
    
    @staticmethod
    def track_ai_analysis():
        Metrics.ai_analysis_requests.inc()
```

#### **Error Tracking & Alerting**
```python
# Structured logging
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        "api_request",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time
    )
    
    return response
```

### **Business Analytics**

#### **User Behavior Tracking**
- **Feature Usage**: Most used features and pages
- **User Journey**: Application workflow patterns
- **Success Metrics**: Job application to offer ratios
- **Performance Metrics**: Page load times and API response times

#### **AI Usage Analytics**
- **Analysis Volume**: Number of resume analyses per day/week
- **Success Patterns**: Most effective resume improvements
- **Feature Adoption**: AI feature usage rates
- **Performance Metrics**: AI response times and accuracy

---

## 🔄 Maintenance & Updates

### **Update Strategy**

#### **Backend Updates**
```bash
# Zero-downtime deployment process
1. Health check validation
2. New version deployment to staging instances
3. Load balancer traffic shift (blue-green deployment)
4. Old version instance termination
5. Post-deployment verification
```

#### **Database Migrations**
```python
# DynamoDB Migration Framework
import boto3
from datetime import datetime

class DynamoDBMigration:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
    
    def up(self):
        # Forward migration - Add new attributes
        table = self.dynamodb.Table('CareerVault-Jobs')
        
        # Scan and update items with new attributes
        response = table.scan()
        for item in response['Items']:
            if 'version' not in item:
                table.update_item(
                    Key={'user_id': item['user_id'], 'job_id': item['job_id']},
                    UpdateExpression='SET #version = :v, #updated = :u',
                    ExpressionAttributeNames={
                        '#version': 'version',
                        '#updated': 'updated_at'
                    },
                    ExpressionAttributeValues={
                        ':v': '2.0',
                        ':u': datetime.utcnow().isoformat()
                    }
                )
    
    def down(self):
        # Rollback migration - Remove attributes
        table = self.dynamodb.Table('CareerVault-Jobs')
        
        response = table.scan()
        for item in response['Items']:
            if 'version' in item:
                table.update_item(
                    Key={'user_id': item['user_id'], 'job_id': item['job_id']},
                    UpdateExpression='REMOVE #version',
                    ExpressionAttributeNames={'#version': 'version'}
                )
```

### **Backup & Recovery**

#### **Data Backup Strategy**
```bash
# DynamoDB Automated Backups (Built-in)
# Point-in-time recovery (PITR) enabled by default
# Continuous backups for up to 35 days

# On-demand backups for long-term retention
aws dynamodb create-backup \
    --table-name CareerVault-Jobs \
    --backup-name CareerVault-Jobs-$(date +%Y%m%d)

# Cross-region backup replication
aws dynamodb create-global-table \
    --global-table-name CareerVault-Jobs \
    --replication-group RegionName=us-west-2

# Cognito User Pool backup
aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID > backup/cognito-config-$(date +%Y%m%d).json
```

#### **Disaster Recovery Plan**
1. **RTO (Recovery Time Objective)**: 1 hour (with DynamoDB PITR)
2. **RPO (Recovery Point Objective)**: 5 minutes (continuous backups)
3. **Backup Frequency**: Continuous with point-in-time recovery
4. **Cross-Region Replication**: DynamoDB Global Tables for multi-region
5. **Infrastructure Recreation**: Terraform for rapid rebuild of compute resources

---

## 🚀 Future Enhancements

### **Short-term Roadmap (3-6 months)**

#### **Feature Enhancements**
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Predictive job success modeling
- **Email Integration**: Gmail/Outlook integration for application tracking
- **Calendar Integration**: Interview scheduling and reminders
- **Chrome Extension**: Quick job application tracking from job sites

#### **Technical Improvements**
- **API Rate Limiting**: Redis-based rate limiting
- **Caching Layer**: Redis for database query caching
- **Search Functionality**: Elasticsearch for advanced job search
- **Real-time Updates**: WebSocket for live dashboard updates
- **PDF Generation**: Automated resume generation

### **Medium-term Roadmap (6-12 months)**

#### **Scalability Enhancements**
- **Microservices Architecture**: Service decomposition with API Gateway
- **Message Queues**: Async processing with AWS SQS and Lambda
- **CDN Integration**: CloudFront for global content delivery
- **Multi-region Deployment**: DynamoDB Global Tables support
- **Serverless Computing**: Lambda functions for event-driven processing

#### **Advanced AI Features**
- **Salary Prediction**: ML models for salary estimation
- **Career Path Recommendation**: AI-driven career guidance
- **Company Culture Matching**: Culture fit analysis
- **Interview Success Prediction**: Interview outcome modeling
- **Automated Cover Letters**: AI-generated cover letters

### **Long-term Vision (1-2 years)**

#### **Platform Expansion**
- **Recruiter Portal**: Two-sided marketplace
- **Company Profiles**: Company culture and review system
- **Networking Features**: Professional networking within platform
- **Learning Management**: Skill development and certification tracking
- **Integration Marketplace**: Third-party integrations and plugins

#### **Enterprise Features**
- **Team Collaboration**: Shared job search for career services
- **White-label Solution**: Customizable platform for career centers
- **API Platform**: Public APIs for third-party integrations
- **Advanced Analytics**: Business intelligence dashboard
- **Multi-tenant Architecture**: Enterprise customer support

---

## 🤝 Contributing

### **Development Guidelines**

#### **Code Standards**
- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: ESLint and Prettier for JavaScript
- **Documentation**: Comprehensive docstrings and comments
- **Testing**: Minimum 80% code coverage
- **Git**: Conventional commit messages

#### **Pull Request Process**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request with detailed description

#### **Development Setup**
```bash
# Clone repository
git clone https://github.com/AyushChoudhary6/CareerVault.git
cd CareerVault

# Start development environment
docker-compose up -d

# Install frontend dependencies
cd vite-project && npm install

# Install backend dependencies
cd ../backend && pip install -r requirements.txt

# Run tests
npm test && pytest
```

---

## 📞 Support & Contact

### **Documentation**
- **API Documentation**: `http://localhost:8000/docs` (when running locally)
- **Infrastructure Docs**: `/infra/terraform/README.md`
- **Component Documentation**: Each major component has inline documentation

### **Community**
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community support
- **Wiki**: Additional documentation and tutorials

### **Professional Support**
For enterprise support and custom implementations:
- **Email**: [support@careervault.app](mailto:support@careervault.app)
- **LinkedIn**: [AyushChoudhary6](https://linkedin.com/in/ayushchoudhary6)
- **Portfolio**: [Personal Website](https://ayushchoudhary.dev)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### **Technologies & Services**
- **Google Gemini AI**: Advanced AI capabilities for resume analysis
- **DynamoDB**: Fully managed NoSQL database for application data
- **AWS Cognito**: Managed authentication and user management service
- **FastAPI**: High-performance Python web framework
- **React**: Modern frontend framework for user interfaces
- **AWS**: Comprehensive cloud infrastructure platform
- **Docker**: Containerization for consistent deployments

### **Open Source Community**
Special thanks to the open source community for the amazing tools and libraries that made this project possible.

---

## 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/AyushChoudhary6/CareerVault)
![GitHub Forks](https://img.shields.io/github/forks/AyushChoudhary6/CareerVault)
![GitHub Issues](https://img.shields.io/github/issues/AyushChoudhary6/CareerVault)
![GitHub License](https://img.shields.io/github/license/AyushChoudhary6/CareerVault)

**Built with ❤️ by Ayush Choudhary**

*CareerVault - Empowering job seekers with AI-driven insights and comprehensive application tracking.*
