"""
DynamoDB Models using Pydantic

This module defines the data models for DynamoDB using Pydantic for validation.
These models replace the MongoDB Beanie models with DynamoDB-compatible structures.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum
import uuid


class JobStatus(str, Enum):
    """Job application status enumeration"""
    APPLIED = "Applied"
    PHONE_SCREEN = "Phone Screen"
    TECHNICAL_INTERVIEW = "Technical Interview"
    FINAL_INTERVIEW = "Final Interview"
    OFFER = "Offer"
    REJECTED = "Rejected"
    WITHDRAWN = "Withdrawn"


class JobType(str, Enum):
    """Job type enumeration"""
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"
    FREELANCE = "Freelance"


# Request/Response Models for API
class JobCreateRequest(BaseModel):
    """Request model for creating a new job application"""
    company: str = Field(..., min_length=1, max_length=100, description="Company name")
    position: str = Field(..., min_length=1, max_length=100, description="Job position/title")
    status: JobStatus = Field(default=JobStatus.APPLIED, description="Application status")
    application_link: Optional[str] = Field(None, max_length=500, description="Job posting URL")
    salary_range: Optional[str] = Field(None, max_length=50, description="Salary range (e.g., '$80k-$120k')")
    location: Optional[str] = Field(None, max_length=100, description="Job location")
    job_type: Optional[JobType] = Field(None, description="Type of employment")
    job_description: Optional[str] = Field(None, max_length=5000, description="Job description text")
    notes: Optional[str] = Field(None, max_length=1000, description="Personal notes about the application")
    interview_date: Optional[datetime] = Field(None, description="Scheduled interview date")
    follow_up_date: Optional[datetime] = Field(None, description="Follow-up reminder date")
    
    class Config:
        json_schema_extra = {
            "example": {
                "company": "Google",
                "position": "Software Engineer",
                "status": "Applied",
                "application_link": "https://careers.google.com/jobs/123",
                "salary_range": "$120k-$180k",
                "location": "Mountain View, CA",
                "job_type": "Full-time",
                "notes": "Applied through university career fair"
            }
        }


class JobUpdateRequest(BaseModel):
    """Request model for updating an existing job application"""
    company: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[JobStatus] = None
    application_link: Optional[str] = Field(None, max_length=500)
    salary_range: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=100)
    job_type: Optional[JobType] = None
    job_description: Optional[str] = Field(None, max_length=5000)
    notes: Optional[str] = Field(None, max_length=1000)
    interview_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None


class JobResponse(BaseModel):
    """Response model for job application data"""
    user_id: str
    job_id: str
    company: str
    position: str
    status: JobStatus
    applied_date: datetime
    application_link: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    job_description: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


# DynamoDB Item Models (internal use)
class JobItem(BaseModel):
    """DynamoDB item model for job applications"""
    user_id: str = Field(..., description="Cognito user ID (sub)")
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique job ID")
    company: str
    position: str
    status: str = JobStatus.APPLIED.value
    applied_date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    application_link: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    job_description: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    # DynamoDB specific fields for indexing
    sk: str = Field(default="JOB", description="Sort key for single table design")
    gsi1_pk: Optional[str] = None  # Global Secondary Index partition key
    gsi1_sk: Optional[str] = None  # Global Secondary Index sort key
    ttl: Optional[int] = None  # Time to live for automatic deletion
    
    @classmethod
    def from_create_request(cls, user_id: str, request: JobCreateRequest) -> "JobItem":
        """Create JobItem from JobCreateRequest"""
        job_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Set GSI keys for status-based queries
        gsi1_pk = request.status.value if request.status else JobStatus.APPLIED.value
        gsi1_sk = now
        
        return cls(
            user_id=user_id,
            job_id=job_id,
            company=request.company,
            position=request.position,
            status=request.status.value if request.status else JobStatus.APPLIED.value,
            applied_date=now,
            application_link=request.application_link,
            salary_range=request.salary_range,
            location=request.location,
            job_type=request.job_type.value if request.job_type else None,
            job_description=request.job_description,
            notes=request.notes,
            interview_date=request.interview_date.isoformat() if request.interview_date else None,
            follow_up_date=request.follow_up_date.isoformat() if request.follow_up_date else None,
            gsi1_pk=gsi1_pk,
            gsi1_sk=gsi1_sk,
            created_at=now,
            updated_at=now
        )
    
    def update_from_request(self, request: JobUpdateRequest) -> "JobItem":
        """Update JobItem from JobUpdateRequest"""
        update_data = request.dict(exclude_unset=True)
        now = datetime.utcnow().isoformat()
        
        for field, value in update_data.items():
            if hasattr(self, field) and value is not None:
                if field in ['status', 'job_type'] and hasattr(value, 'value'):
                    setattr(self, field, value.value)
                elif field in ['interview_date', 'follow_up_date'] and isinstance(value, datetime):
                    setattr(self, field, value.isoformat())
                else:
                    setattr(self, field, value)
        
        # Update GSI keys if status changed
        if 'status' in update_data:
            self.gsi1_pk = update_data['status'].value if hasattr(update_data['status'], 'value') else update_data['status']
            self.gsi1_sk = now
        
        self.updated_at = now
        return self
    
    def to_response(self) -> JobResponse:
        """Convert JobItem to JobResponse"""
        return JobResponse(
            user_id=self.user_id,
            job_id=self.job_id,
            company=self.company,
            position=self.position,
            status=JobStatus(self.status),
            applied_date=datetime.fromisoformat(self.applied_date.replace('Z', '+00:00')) if 'Z' in self.applied_date else datetime.fromisoformat(self.applied_date),
            application_link=self.application_link,
            salary_range=self.salary_range,
            location=self.location,
            job_type=JobType(self.job_type) if self.job_type else None,
            job_description=self.job_description,
            notes=self.notes,
            interview_date=datetime.fromisoformat(self.interview_date.replace('Z', '+00:00')) if self.interview_date and 'Z' in self.interview_date else datetime.fromisoformat(self.interview_date) if self.interview_date else None,
            follow_up_date=datetime.fromisoformat(self.follow_up_date.replace('Z', '+00:00')) if self.follow_up_date and 'Z' in self.follow_up_date else datetime.fromisoformat(self.follow_up_date) if self.follow_up_date else None,
            created_at=datetime.fromisoformat(self.created_at.replace('Z', '+00:00')) if 'Z' in self.created_at else datetime.fromisoformat(self.created_at),
            updated_at=datetime.fromisoformat(self.updated_at.replace('Z', '+00:00')) if 'Z' in self.updated_at else datetime.fromisoformat(self.updated_at)
        )


# User Models for Cognito + DynamoDB
class UserMetadata(BaseModel):
    """User metadata stored in DynamoDB (additional to Cognito)"""
    user_id: str = Field(..., description="Cognito user ID (sub)")
    email: str
    username: str
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    last_login: Optional[str] = None
    job_count: int = Field(default=0, description="Cache of total job applications")
    
    # Analytics fields
    total_applications: int = 0
    total_interviews: int = 0
    total_offers: int = 0
    total_rejections: int = 0


# Authentication Models (Cognito-based)
class UserSignup(BaseModel):
    """User signup request model"""
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    given_name: Optional[str] = Field(None, max_length=50, description="First name")
    family_name: Optional[str] = Field(None, max_length=50, description="Last name")
    
    @field_validator('username')
    def validate_username(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, hyphens, and underscores')
        return v.lower()
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "password": "SecurePassword123!",
                "given_name": "John",
                "family_name": "Doe"
            }
        }


class UserLogin(BaseModel):
    """User login request model"""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="User password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "password": "SecurePassword123!"
            }
        }


class CognitoTokenResponse(BaseModel):
    """Cognito authentication response model"""
    access_token: str
    id_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"


class UserResponse(BaseModel):
    """User information response model"""
    user_id: str
    username: str
    email: str
    email_verified: bool = True
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


# Generic Response Models
class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Operation completed successfully",
                "success": True
            }
        }


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    success: bool = False
