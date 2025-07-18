"""
Job Routes - MongoDB Version

This module handles job application management including:
- Creating new job applications
- Retrieving job applications
- Updating job applications
- Deleting job applications
- Getting job statistics
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from app.utils.models_mongo import JobCreate, JobUpdate, JobResponse, JobStatsResponse, MessageResponse
from app.utils.mongodb_service import JobService
from app.utils.security import get_current_user_id_mongo

router = APIRouter()


@router.get("/", response_model=List[JobResponse])
async def get_jobs(current_user_id: str = Depends(get_current_user_id_mongo)):
    """
    Get all job applications for the current user
    
    Args:
        current_user_id: User ID from JWT token
        
    Returns:
        List[JobResponse]: List of user's job applications
    """
    try:
        jobs = await JobService.get_jobs_by_user(current_user_id)
        
        # Convert to response format
        job_responses = []
        for job in jobs:
            job_responses.append(JobResponse(
                id=str(job.id),
                user_id=str(job.user_id),
                company=job.company,
                position=job.position,
                status=job.status,
                applied_date=job.applied_date,
                application_link=job.application_link,
                notes=job.notes,
                created_at=job.created_at,
                updated_at=job.updated_at,
                salary_range=job.salary_range,
                location=job.location,
                job_type=job.job_type,
                interview_date=job.interview_date,
                follow_up_date=job.follow_up_date
            ))
        
        return job_responses
    
    except Exception as e:
        print(f"Error getting jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job applications"
        )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, current_user_id: str = Depends(get_current_user_id_mongo)):
    """
    Get a specific job application by ID
    
    Args:
        job_id: Job application ID
        current_user_id: User ID from JWT token
        
    Returns:
        JobResponse: Job application details
        
    Raises:
        HTTPException: If job not found or access denied
    """
    job = await JobService.get_job_by_id(job_id, current_user_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found"
        )
    
    return JobResponse(
        id=str(job.id),
        user_id=str(job.user_id),
        company=job.company,
        position=job.position,
        status=job.status,
        applied_date=job.applied_date,
        application_link=job.application_link,
        notes=job.notes,
        created_at=job.created_at,
        updated_at=job.updated_at,
        salary_range=job.salary_range,
        location=job.location,
        job_type=job.job_type,
        interview_date=job.interview_date,
        follow_up_date=job.follow_up_date
    )


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(job_data: JobCreate, current_user_id: str = Depends(get_current_user_id_mongo)):
    """
    Create a new job application
    
    Args:
        job_data: Job application data
        current_user_id: User ID from JWT token
        
    Returns:
        JobResponse: Created job application
        
    Raises:
        HTTPException: If creation fails
    """
    print(f"📝 Job creation request - User ID: {current_user_id}")
    print(f"📝 Job creation request - Job data: {job_data}")
    try:
        new_job = await JobService.create_job(job_data, current_user_id)
        
        return JobResponse(
            id=str(new_job.id),
            user_id=str(new_job.user_id),
            company=new_job.company,
            position=new_job.position,
            status=new_job.status,
            applied_date=new_job.applied_date,
            application_link=new_job.application_link,
            notes=new_job.notes,
            created_at=new_job.created_at,
            updated_at=new_job.updated_at,
            salary_range=new_job.salary_range,
            location=new_job.location,
            job_type=new_job.job_type,
            interview_date=new_job.interview_date,
            follow_up_date=new_job.follow_up_date
        )
    
    except Exception as e:
        print(f"Error creating job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job application"
        )


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user_id: str = Depends(get_current_user_id_mongo)
):
    """
    Update a job application
    
    Args:
        job_id: Job application ID to update
        job_data: Updated job data
        current_user_id: User ID from JWT token
        
    Returns:
        JobResponse: Updated job application
        
    Raises:
        HTTPException: If job not found or update fails
    """
    updated_job = await JobService.update_job(job_id, current_user_id, job_data)
    
    if not updated_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found"
        )
    
    return JobResponse(
        id=str(updated_job.id),
        user_id=str(updated_job.user_id),
        company=updated_job.company,
        position=updated_job.position,
        status=updated_job.status,
        applied_date=updated_job.applied_date,
        application_link=updated_job.application_link,
        notes=updated_job.notes,
        created_at=updated_job.created_at,
        updated_at=updated_job.updated_at,
        salary_range=updated_job.salary_range,
        location=updated_job.location,
        job_type=updated_job.job_type,
        interview_date=updated_job.interview_date,
        follow_up_date=updated_job.follow_up_date
    )


@router.delete("/{job_id}", response_model=MessageResponse)
async def delete_job(job_id: str, current_user_id: str = Depends(get_current_user_id_mongo)):
    """
    Delete a job application
    
    Args:
        job_id: Job application ID to delete
        current_user_id: User ID from JWT token
        
    Returns:
        MessageResponse: Success message
        
    Raises:
        HTTPException: If job not found or deletion fails
    """
    success = await JobService.delete_job(job_id, current_user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found"
        )
    
    return MessageResponse(
        message="Job application deleted successfully",
        success=True
    )


@router.get("/stats/summary", response_model=JobStatsResponse)
async def get_job_stats(current_user_id: str = Depends(get_current_user_id_mongo)):
    """
    Get job application statistics for the current user
    
    Args:
        current_user_id: User ID from JWT token
        
    Returns:
        JobStatsResponse: Job application statistics
    """
    try:
        stats = await JobService.get_job_stats(current_user_id)
        
        return JobStatsResponse(**stats)
    
    except Exception as e:
        print(f"Error getting job stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job statistics"
        )
