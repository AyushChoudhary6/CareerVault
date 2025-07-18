"""
Database Configuration and Models

This module sets up SQLite database connection using SQLAlchemy ORM.
It includes database models and session management for the Job Tracker API.
Later this can be easily swapped with DynamoDB for production.
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime
from typing import Generator
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./job_tracker.db")

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


class User(Base):
    """
    User database model
    
    Attributes:
        id: Primary key
        username: Unique username
        email: Unique email address
        hashed_password: Bcrypt hashed password
        created_at: Account creation timestamp
        jobs: Related job applications
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with jobs
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")


class Job(Base):
    """
    Job application database model
    
    Attributes:
        id: Primary key
        company: Company name
        position: Job position/title
        status: Application status (Applied, Interview, Offer, Rejected)
        applied_date: Date when application was submitted
        application_link: URL to job posting (optional)
        notes: Additional notes (optional)
        created_at: Record creation timestamp
        updated_at: Record last update timestamp
        user_id: Foreign key to user
        user: Related user object
    """
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(100), nullable=False, index=True)
    position = Column(String(100), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="Applied", index=True)
    applied_date = Column(String(10), nullable=False)  # Stored as YYYY-MM-DD string
    application_link = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship with user
    user = relationship("User", back_populates="jobs")


def create_tables():
    """
    Create all database tables
    
    This function is called on app startup to ensure all tables exist.
    """
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency
    
    This function provides a database session for FastAPI dependency injection.
    It ensures proper session cleanup after each request.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database utility functions
def get_user_by_email(db: Session, email: str) -> User:
    """
    Get user by email address
    
    Args:
        db: Database session
        email: User's email address
        
    Returns:
        User: User object or None if not found
    """
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> User:
    """
    Get user by username
    
    Args:
        db: Database session
        username: User's username
        
    Returns:
        User: User object or None if not found
    """
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> User:
    """
    Get user by ID
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        User: User object or None if not found
    """
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, username: str, email: str, hashed_password: str) -> User:
    """
    Create a new user
    
    Args:
        db: Database session
        username: User's username
        email: User's email
        hashed_password: Bcrypt hashed password
        
    Returns:
        User: Created user object
    """
    db_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_jobs(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list:
    """
    Get all jobs for a user with pagination
    
    Args:
        db: Database session
        user_id: User's ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        list: List of job objects
    """
    return db.query(Job).filter(Job.user_id == user_id).offset(skip).limit(limit).all()


def get_job_by_id(db: Session, job_id: int, user_id: int) -> Job:
    """
    Get a specific job by ID for a user
    
    Args:
        db: Database session
        job_id: Job's ID
        user_id: User's ID (for security)
        
    Returns:
        Job: Job object or None if not found
    """
    return db.query(Job).filter(Job.id == job_id, Job.user_id == user_id).first()


def create_job(db: Session, job_data: dict, user_id: int) -> Job:
    """
    Create a new job application
    
    Args:
        db: Database session
        job_data: Job data dictionary
        user_id: User's ID
        
    Returns:
        Job: Created job object
    """
    db_job = Job(**job_data, user_id=user_id)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def update_job(db: Session, job_id: int, job_data: dict, user_id: int) -> Job:
    """
    Update a job application
    
    Args:
        db: Database session
        job_id: Job's ID
        job_data: Updated job data
        user_id: User's ID (for security)
        
    Returns:
        Job: Updated job object or None if not found
    """
    db_job = get_job_by_id(db, job_id, user_id)
    if db_job:
        for key, value in job_data.items():
            if value is not None:
                setattr(db_job, key, value)
        setattr(db_job, 'updated_at', datetime.utcnow())
        db.commit()
        db.refresh(db_job)
    return db_job


def delete_job(db: Session, job_id: int, user_id: int) -> bool:
    """
    Delete a job application
    
    Args:
        db: Database session
        job_id: Job's ID
        user_id: User's ID (for security)
        
    Returns:
        bool: True if deleted, False if not found
    """
    db_job = get_job_by_id(db, job_id, user_id)
    if db_job:
        db.delete(db_job)
        db.commit()
        return True
    return False


def count_user_jobs(db: Session, user_id: int) -> int:
    """
    Count total jobs for a user
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        int: Total number of jobs
    """
    return db.query(Job).filter(Job.user_id == user_id).count()
