"""
FastAPI Job Tracker Backend Application

This is the main entry point for the Job Tracker API.
It sets up the FastAPI app, includes routers, and configures middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, jobs
from app.utils.database import create_tables

# Initialize FastAPI app with metadata
app = FastAPI(
    title="Job Tracker API",
    description="A comprehensive job application tracking system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend integration - Development Mode (Allow all localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",  # Allow any localhost port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables when the application starts"""
    create_tables()

# Include API routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])

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
