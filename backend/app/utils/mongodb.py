"""
MongoDB Database Configuration

This module handles MongoDB connection and initialization using Motor and Beanie.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Models
from .models_mongo import User, Job

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

# MongoDB connection string from environment
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://awesomea12005:CgaagLstpLMAsZov@cluster0.znrn1nm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "job_tracker")

# Global MongoDB instance
mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    try:
        # Create Motor client
        mongodb.client = AsyncIOMotorClient(MONGODB_URL)
        
        # Get database
        mongodb.database = mongodb.client[DATABASE_NAME]
        
        # Initialize Beanie with the Product document class and a database
        await init_beanie(
            database=mongodb.database,
            document_models=[User, Job]
        )
        
        print("✅ Connected to MongoDB successfully!")
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client:
        mongodb.client.close()
        print("🔌 Disconnected from MongoDB")

async def get_database():
    """Get database instance for dependency injection"""
    return mongodb.database
