"""
FastAPI Job Tracker Backend Application - DynamoDB + Cognito Version

This is the main entry point for the Job Tracker API using:
- DynamoDB for data storage
- AWS Cognito for authentication
- Google Gemini AI for career assistance
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import os

# Import the new route modules
from app.routes import auth_cognito, jobs_dynamodb, ai_career
from app.utils.dynamodb_config import dynamodb_config
from app.utils.cognito_service import cognito_config


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events
    """
    # Startup
    print("🚀 Starting CareerVault API with DynamoDB + Cognito...")
    
    try:
        # Initialize DynamoDB tables (development only)
        if os.getenv("ENVIRONMENT", "development") == "development":
            print("📊 Creating DynamoDB tables if they don't exist...")
            dynamodb_config.create_tables_if_not_exist()
        
        # Test Cognito connectivity
        print("🔐 Testing Cognito connectivity...")
        cognito_client = cognito_config.cognito_client
        if cognito_client:
            print("✅ Cognito connection established")
        else:
            print("⚠️  Warning: Cognito connection not established")
        
        print("✅ CareerVault API startup complete!")
        
    except Exception as e:
        print(f"❌ Startup error: {e}")
        # Don't fail startup completely, allow app to run
    
    yield
    
    # Shutdown
    print("🛑 Shutting down CareerVault API...")
    print("✅ Shutdown complete")


# Initialize FastAPI app with metadata and lifespan
app = FastAPI(
    title="CareerVault API",
    description="AI-Powered Job Application Tracking System using DynamoDB and AWS Cognito",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        # Add production origins here
        # "https://your-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Include API routers with updated modules
app.include_router(auth_cognito.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs_dynamodb.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(ai_career.router, prefix="/api/ai", tags=["AI Career Assistant"])

# Root endpoint
@app.get("/", tags=["Health Check"])
def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "CareerVault API - AI-Powered Job Tracking",
        "version": "2.0.0",
        "architecture": "DynamoDB + AWS Cognito",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Health Check"])
async def health_check():
    """
    Comprehensive health check endpoint
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "services": {}
    }
    
    # Check DynamoDB connectivity
    try:
        # Test DynamoDB connection
        jobs_table = dynamodb_config.jobs_table
        if jobs_table:
            # Try to describe the table
            table_description = jobs_table.meta.client.describe_table(
                TableName=jobs_table.table_name
            )
            health_status["services"]["dynamodb"] = {
                "status": "healthy",
                "table_status": table_description['Table']['TableStatus']
            }
        else:
            health_status["services"]["dynamodb"] = {
                "status": "unhealthy",
                "error": "Table reference not available"
            }
    except Exception as e:
        health_status["services"]["dynamodb"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check Cognito connectivity
    try:
        # Test Cognito connection
        cognito_client = cognito_config.cognito_client
        if cognito_client:
            # Try to describe the user pool
            user_pool_description = cognito_client.describe_user_pool(
                UserPoolId=cognito_config.user_pool_id
            )
            health_status["services"]["cognito"] = {
                "status": "healthy",
                "user_pool_status": user_pool_description['UserPool']['Status']
            }
        else:
            health_status["services"]["cognito"] = {
                "status": "unhealthy",
                "error": "Client not available"
            }
    except Exception as e:
        health_status["services"]["cognito"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check AI service (Gemini)
    try:
        # Test if Gemini API key is configured
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            health_status["services"]["gemini_ai"] = {
                "status": "configured",
                "note": "API key available"
            }
        else:
            health_status["services"]["gemini_ai"] = {
                "status": "not_configured",
                "error": "API key not found"
            }
    except Exception as e:
        health_status["services"]["gemini_ai"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Set overall status based on critical services
    critical_services = ["dynamodb", "cognito"]
    unhealthy_critical = [
        service for service in critical_services 
        if health_status["services"].get(service, {}).get("status") == "unhealthy"
    ]
    
    if unhealthy_critical:
        health_status["status"] = "unhealthy"
        health_status["critical_issues"] = unhealthy_critical
    
    return health_status


@app.get("/api/info", tags=["API Info"])
def api_info():
    """
    API information and configuration details
    """
    return {
        "name": "CareerVault API",
        "version": "2.0.0",
        "description": "AI-Powered Job Application Tracking System",
        "architecture": {
            "database": "Amazon DynamoDB",
            "authentication": "AWS Cognito User Pools",
            "ai_service": "Google Gemini AI",
            "backend": "FastAPI + Python",
            "frontend": "React + Vite"
        },
        "features": [
            "Job application tracking",
            "AI-powered resume analysis",
            "Career guidance and insights",
            "Application status management",
            "Analytics and reporting",
            "Secure authentication with MFA support"
        ],
        "endpoints": {
            "authentication": "/auth",
            "jobs": "/api/jobs",
            "ai_assistant": "/api/ai",
            "documentation": "/docs",
            "health_check": "/health"
        },
        "environment": os.getenv("ENVIRONMENT", "development"),
        "aws_region": os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return {
        "error": "Not Found",
        "detail": "The requested resource was not found",
        "status_code": 404,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    return {
        "error": "Internal Server Error",
        "detail": "An unexpected error occurred",
        "status_code": 500,
        "timestamp": datetime.utcnow().isoformat()
    }


# Middleware for request logging (optional)
@app.middleware("http")
async def log_requests(request, call_next):
    """Log all requests for debugging"""
    start_time = datetime.utcnow()
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Log request (you could use proper logging here)
    print(f"🌐 {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    
    return response


if __name__ == "__main__":
    import uvicorn
    
    # Development server configuration
    uvicorn.run(
        "main_dynamodb:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
