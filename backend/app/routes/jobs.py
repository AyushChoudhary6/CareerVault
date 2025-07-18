"""
Job Application Routes

This module handles all CRUD operations for job applications:
- Create new job applications
- List user's job applications with pagination
- Get specific job details
- Update job applications
- Delete job applications

All routes are protected with JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import JobCreate, JobUpdate, JobResponse, MessageResponse, JobListResponse
from app.utils.database import (
    get_db, get_user_jobs, get_job_by_id, create_job, 
    update_job, delete_job, count_user_jobs
)
from app.utils.security import get_current_user_id
import math

router = APIRouter()


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job_application(
    job_data: JobCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new job application
    
    Args:
        job_data: Job application data
        current_user_id: ID of authenticated user
        db: Database session
        
    Returns:
        JobResponse: Created job application
        
    Raises:
        HTTPException: If creation fails
    """
    try:
        # Convert Pydantic model to dict for database
        job_dict = job_data.dict()
        
        # Create job in database
        new_job = create_job(db=db, job_data=job_dict, user_id=current_user_id)
        
        return JobResponse.from_orm(new_job)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job application"
        )


@router.get("/", response_model=JobListResponse)
async def list_job_applications(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    status_filter: Optional[str] = Query(None, description="Filter by job status"),
    company_filter: Optional[str] = Query(None, description="Filter by company name"),
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List all job applications for the authenticated user with pagination and filtering
    
    Args:
        page: Page number (1-based)
        size: Number of items per page
        status_filter: Optional status filter
        company_filter: Optional company filter
        current_user_id: ID of authenticated user
        db: Database session
        
    Returns:
        JobListResponse: Paginated list of job applications
    """
    # Calculate offset
    skip = (page - 1) * size
    
    # Get total count for pagination
    total_jobs = count_user_jobs(db=db, user_id=current_user_id)
    
    # Get jobs with pagination
    jobs = get_user_jobs(db=db, user_id=current_user_id, skip=skip, limit=size)
    
    # Apply filters if provided
    if status_filter:
        jobs = [job for job in jobs if job.status == status_filter]
    
    if company_filter:
        jobs = [job for job in jobs if company_filter.lower() in job.company.lower()]
    
    # Calculate pagination info
    total_pages = math.ceil(total_jobs / size) if total_jobs > 0 else 1
    
    return JobListResponse(
        jobs=[JobResponse.from_orm(job) for job in jobs],
        total=total_jobs,
        page=page,
        size=size,
        pages=total_pages
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job_application(
    job_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific job application
    
    Args:
        job_id: ID of the job application
        current_user_id: ID of authenticated user
        db: Database session
        
    Returns:
        JobResponse: Job application details
        
    Raises:
        HTTPException: If job not found or user doesn't have access
    """
    job = get_job_by_id(db=db, job_id=job_id, user_id=current_user_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found"
        )
    
    return JobResponse.from_orm(job)


@router.put("/{job_id}", response_model=JobResponse)
async def update_job_application(
    job_id: int,
    job_data: JobUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update a job application
    
    Args:
        job_id: ID of the job application
        job_data: Updated job data
        current_user_id: ID of authenticated user
        db: Database session
        
    Returns:
        JobResponse: Updated job application
        
    Raises:
        HTTPException: If job not found or update fails
    """
    # Check if job exists and belongs to user
    existing_job = get_job_by_id(db=db, job_id=job_id, user_id=current_user_id)
    
    if not existing_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found"
        )
    
    try:
        # Convert Pydantic model to dict, excluding None values
        update_data = job_data.dict(exclude_unset=True)
        
        # Update job in database
        updated_job = update_job(
            db=db, 
            job_id=job_id, 
            job_data=update_data, 
            user_id=current_user_id
        )
        
        if not updated_job:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update job application"
            )
        
        return JobResponse.from_orm(updated_job)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job application"
        )


@router.delete("/{job_id}", response_model=MessageResponse)
async def delete_job_application(
    job_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a job application
    
    Args:
        job_id: ID of the job application
        current_user_id: ID of authenticated user
        db: Database session
        
    Returns:
        MessageResponse: Success message
        
    Raises:
        HTTPException: If job not found or deletion fails
    """
    # Check if job exists and belongs to user
    existing_job = get_job_by_id(db=db, job_id=job_id, user_id=current_user_id)
    
    if not existing_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found"
        )
    
    # Delete the job
    deleted = delete_job(db=db, job_id=job_id, user_id=current_user_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete job application"
        )
    
    return MessageResponse(
        message="Job application deleted successfully",
        success=True
    )


@router.get("/stats/summary")
async def get_job_statistics(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get job application statistics for the authenticated user
    
    Args:
        current_user_id: ID of authenticated user
        db: Database session
        
    Returns:
        dict: Job statistics summary
    """
    # Get all user's jobs
    all_jobs = get_user_jobs(db=db, user_id=current_user_id, skip=0, limit=1000)
    
    # Calculate statistics
    total_jobs = len(all_jobs)
    status_counts = {}
    
    for job in all_jobs:
        status = job.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Calculate success rate
    offers = status_counts.get('Offer', 0)
    success_rate = round((offers / total_jobs) * 100, 2) if total_jobs > 0 else 0
    
    return {
        "total_applications": total_jobs,
        "status_breakdown": status_counts,
        "success_rate": success_rate,
        "recent_applications": len([job for job in all_jobs[-5:]]),  # Last 5 applications
    }
