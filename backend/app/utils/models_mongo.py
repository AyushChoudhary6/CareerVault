"""
MongoDB Models using Beanie

This module defines the database models for MongoDB using Beanie ODM.
"""

from datetime import datetime, date
from typing import Optional, List, Union
from beanie import Document
from pydantic import EmailStr, BaseModel, Field, field_serializer, field_validator
from bson import ObjectId
from pydantic import ConfigDict


class User(Document):
    """User model for MongoDB"""
    username: str
    email: EmailStr
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "hashed_password": "hashed_password_here",
                "is_active": True
            }
        }
    )
    
    class Settings:
        name = "users"
        indexes = [
            "username",
            "email"
        ]
        
    def __repr__(self):
        return f"<User {self.username}>"
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at,
            "is_active": self.is_active
        }


class Job(Document):
    """Job application model for MongoDB"""
    user_id: str  # Store as string instead of ObjectId
    company: str
    position: str
    status: str = "Applied"  # Applied, Interview, Offer, Rejected
    applied_date: datetime  # Changed from date to datetime
    application_link: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Additional fields for future features
    salary_range: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None  # Full-time, Part-time, Contract, etc.
    interview_date: Optional[datetime] = None  # Changed from date to datetime
    follow_up_date: Optional[datetime] = None  # Changed from date to datetime
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "company": "Google",
                "position": "Software Engineer",
                "status": "Applied",
                "applied_date": "2025-07-17T00:00:00"
            }
        }
    )
    
    class Settings:
        name = "jobs"
        
    def __repr__(self):
        return f"<Job {self.position} at {self.company}>"
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "company": self.company,
            "position": self.position,
            "status": self.status,
            "applied_date": self.applied_date.isoformat() if self.applied_date else None,
            "application_link": self.application_link,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "salary_range": self.salary_range,
            "location": self.location,
            "job_type": self.job_type,
            "interview_date": self.interview_date.isoformat() if self.interview_date else None,
            "follow_up_date": self.follow_up_date.isoformat() if self.follow_up_date else None,
        }


# Pydantic models for API requests/responses
class UserSignup(BaseModel):
    """User signup request model"""
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """User login request model"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response model"""
    id: str
    username: str
    email: str
    created_at: datetime
    is_active: bool


class JobCreate(BaseModel):
    """Job creation request model"""
    company: str
    position: str
    status: str = "Applied"
    applied_date: Union[datetime, str]  # Allow both datetime and string
    application_link: Optional[str] = None
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    interview_date: Optional[Union[datetime, str]] = None  # Allow both datetime and string
    follow_up_date: Optional[Union[datetime, str]] = None  # Allow both datetime and string

    @field_validator('applied_date')
    @classmethod
    def parse_applied_date(cls, v):
        if isinstance(v, str):
            try:
                # Try parsing as date first (YYYY-MM-DD)
                if len(v) == 10 and v.count('-') == 2:
                    parsed_date = datetime.strptime(v, '%Y-%m-%d')
                    return parsed_date
                # Try parsing as datetime
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError(f"Invalid date format: {v}")
        return v

    @field_validator('interview_date', 'follow_up_date')
    @classmethod
    def parse_optional_dates(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                # Try parsing as date first (YYYY-MM-DD)
                if len(v) == 10 and v.count('-') == 2:
                    parsed_date = datetime.strptime(v, '%Y-%m-%d')
                    return parsed_date
                # Try parsing as datetime
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError(f"Invalid date format: {v}")
        return v


class JobUpdate(BaseModel):
    """Job update request model"""
    company: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[Union[datetime, str]] = None  # Allow both datetime and string
    application_link: Optional[str] = None
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    interview_date: Optional[Union[datetime, str]] = None  # Allow both datetime and string
    follow_up_date: Optional[Union[datetime, str]] = None  # Allow both datetime and string

    @field_validator('applied_date', 'interview_date', 'follow_up_date')
    @classmethod
    def parse_optional_dates(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                # Try parsing as date first (YYYY-MM-DD)
                if len(v) == 10 and v.count('-') == 2:
                    parsed_date = datetime.strptime(v, '%Y-%m-%d')
                    return parsed_date
                # Try parsing as datetime
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError(f"Invalid date format: {v}")
        return v


class JobResponse(BaseModel):
    """Job response model"""
    id: str
    user_id: str
    company: str
    position: str
    status: str
    applied_date: datetime  # Changed from date to datetime
    application_link: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    salary_range: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    interview_date: Optional[datetime] = None  # Changed from date to datetime
    follow_up_date: Optional[datetime] = None  # Changed from date to datetime


class Token(BaseModel):
    """JWT Token response model"""
    access_token: str
    token_type: str
    user_id: str
    username: str
    email: str


class MessageResponse(BaseModel):
    """Generic message response model"""
    message: str
    success: bool = True


class JobStatsResponse(BaseModel):
    """Job statistics response model"""
    total_jobs: int
    total_applied: int
    total_interviews: int
    total_offers: int
    total_rejected: int
    application_rate: float  # jobs per week/month
    success_rate: float  # offers/applications ratio
