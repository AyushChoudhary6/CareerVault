"""
Pydantic Models for Data Validation

This module contains all the Pydantic models used for request/response validation
in the Job Tracker API. These models ensure data integrity and provide automatic
API documentation.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    """Enumeration for job application statuses"""
    APPLIED = "Applied"
    INTERVIEW = "Interview"
    OFFER = "Offer"
    REJECTED = "Rejected"


# User Authentication Models
class UserSignup(BaseModel):
    """Model for user registration"""
    username: str = Field(..., min_length=3, max_length=50, description="Username (3-50 characters)")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password (minimum 6 characters)")
    
    @field_validator('username')
    def validate_username(cls, v):
        """Validate username contains only alphanumeric characters and underscores"""
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must contain only letters, numbers, and underscores')
        return v.lower()
    
    @field_validator('email')
    def validate_email(cls, v):
        """Convert email to lowercase"""
        return v.lower()


class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")
    
    @field_validator('email')
    def validate_email(cls, v):
        """Convert email to lowercase"""
        return v.lower()


class UserResponse(BaseModel):
    """Model for user data in responses (excludes password)"""
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Model for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


# Job Application Models
class JobCreate(BaseModel):
    """Model for creating a new job application"""
    company: str = Field(..., min_length=1, max_length=100, description="Company name")
    position: str = Field(..., min_length=1, max_length=100, description="Job position/title")
    status: JobStatus = Field(default=JobStatus.APPLIED, description="Application status")
    applied_date: str = Field(..., description="Date applied (YYYY-MM-DD format)")
    application_link: Optional[str] = Field(None, max_length=500, description="URL to job posting")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")
    
    @field_validator('applied_date')
    def validate_date(cls, v):
        """Validate date format"""
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')


class JobUpdate(BaseModel):
    """Model for updating a job application"""
    company: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[JobStatus] = None
    applied_date: Optional[str] = None
    application_link: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    
    @field_validator('applied_date')
    def validate_date(cls, v):
        """Validate date format if provided"""
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v


class JobResponse(BaseModel):
    """Model for job application in responses"""
    id: int
    company: str
    position: str
    status: JobStatus
    applied_date: str
    application_link: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    """Model for paginated job list response"""
    jobs: List[JobResponse]
    total: int
    page: int
    size: int
    pages: int


# Response Models
class MessageResponse(BaseModel):
    """Generic message response model"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response model"""
    message: str
    error_code: Optional[str] = None
    success: bool = False
