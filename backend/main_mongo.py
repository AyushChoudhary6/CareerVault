"""
FastAPI CareerVault Backend - MongoDB Version

This is the main application file for the Job Tracker API using MongoDB.
It includes:
- FastAPI application setup
- MongoDB connection management
- Route registration
- CORS configuration
- Error handling
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import MongoDB connection utilities
from app.utils.mongodb import connect_to_mongo, close_mongo_connection

# Import route modules
from app.routes.auth import router as auth_router
from app.routes.jobs_mongo import router as jobs_router
from app.routes.ai_career import router as ai_career_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for MongoDB connections
    """
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    print("🚀 Job Tracker API (MongoDB) is starting up...")
    
    yield
    
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()
    print("🔚 Job Tracker API (MongoDB) is shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Job Tracker API - MongoDB",
    description="A professional job application tracking system with MongoDB backend",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins + [
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint providing API information
    """
    return {
        "message": "🎯 Job Tracker API (MongoDB) is running!",
        "version": "2.0.0",
        "database": "MongoDB",
        "documentation": "/docs"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "database": "MongoDB",
        "timestamp": "2025-07-17"
    }


# Include route modules
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs_router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(ai_career_router, prefix="/api/ai", tags=["AI Career Assistant"])


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors
    """
    print(f"Unhandled error: {exc}")
    return HTTPException(
        status_code=500,
        detail="An internal server error occurred"
    )


if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print(f"🚀 Starting Job Tracker API on {host}:{port}")
    print(f"📖 API Documentation: http://localhost:{port}/docs")
    
    uvicorn.run(
        "main_mongo:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
