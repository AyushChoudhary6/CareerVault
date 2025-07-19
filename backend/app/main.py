"""
FastAPI Job Tracker Backend Application

This is the main entry point for the Job Tracker API.
It sets up the FastAPI app, includes routers, and configures middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, jobs_mongo, ai_career
from app.utils.mongodb import connect_to_mongo

# Initialize FastAPI app with metadata
app = FastAPI(
    title="Job Tracker API",
    description="A comprehensive job application tracking system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend integration - Development Mode
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize MongoDB on startup
@app.on_event("startup")
async def startup_event():
    """Initialize MongoDB connection when the application starts"""
    await connect_to_mongo()

# Include API routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs_mongo.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(ai_career.router, prefix="/api/ai", tags=["AI Career Assistant"])

# Root endpoint
@app.get("/", tags=["Health Check"])
def root():
    """
    Root endpoint to verify the API is running
    
    Returns:
        dict: Welcome message with API status
    """
    return {
        "message": "🚀 Job Tracker API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }
