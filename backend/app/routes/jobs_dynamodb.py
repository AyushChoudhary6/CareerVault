"""
Job Management Routes - DynamoDB Version

This module handles job application CRUD operations using DynamoDB,
replacing the MongoDB implementation.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi import status as http_status
from typing import List, Optional
from datetime import datetime
from app.utils.models_dynamodb import (
    JobCreateRequest, JobUpdateRequest, JobResponse, 
    MessageResponse, JobStatus
)
from app.utils.dynamodb_service import (
    create_job, get_user_jobs, get_job_by_id,
    update_job, delete_job, get_user_job_stats
)
from app.utils.security_cognito import get_current_user_id

router = APIRouter()


@router.post("/", response_model=JobResponse, status_code=http_status.HTTP_201_CREATED)
async def create_job_application(
    job_data: JobCreateRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a new job application
    
    Args:
        job_data: Job application data
        current_user_id: Current authenticated user ID
        
    Returns:
        JobResponse: Created job application
        
    Raises:
        HTTPException: If creation fails
    """
    try:
        # Create job in DynamoDB
        new_job = await create_job(current_user_id, job_data)
        
        return new_job
        
    except Exception as e:
        print(f"Error creating job: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job application"
        )


@router.get("/", response_model=List[JobResponse])
async def get_job_applications(
    current_user_id: str = Depends(get_current_user_id),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Maximum number of jobs to return"),
    status_filter: Optional[JobStatus] = Query(None, description="Filter by job status")
):
    """
    Get all job applications for the current user
    
    Args:
        current_user_id: Current authenticated user ID
        limit: Optional limit on number of results
        status_filter: Optional status filter
        
    Returns:
        List[JobResponse]: List of job applications
        
    Raises:
        HTTPException: If retrieval fails
    """
    try:
        # Get user's jobs from DynamoDB
        jobs = await get_user_jobs(current_user_id, limit)
        
        # Apply status filter if provided
        if status_filter:
            jobs = [job for job in jobs if job.status == status_filter]
        
        return jobs
        
    except Exception as e:
        print(f"Error getting jobs: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job applications"
        )


@router.get("/stats")
async def get_job_statistics(current_user_id: str = Depends(get_current_user_id)):
    """
    Get job application statistics for the current user
    
    Args:
        current_user_id: Current authenticated user ID
        
    Returns:
        Dict: Job statistics by status
        
    Raises:
        HTTPException: If retrieval fails
    """
    try:
        stats = await get_user_job_stats(current_user_id)
        return stats
        
    except Exception as e:
        print(f"Error getting job stats: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job statistics"
        )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job_application(
    job_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific job application by ID
    
    Args:
        job_id: Job application ID
        current_user_id: Current authenticated user ID
        
    Returns:
        JobResponse: Job application data
        
    Raises:
        HTTPException: If job not found or access denied
    """
    try:
        # Get job from DynamoDB
        job = await get_job_by_id(current_user_id, job_id)
        
        if not job:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Job application not found"
            )
        
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting job: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job application"
        )


@router.put("/{job_id}", response_model=JobResponse)
async def update_job_application(
    job_id: str,
    job_update: JobUpdateRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Update a job application
    
    Args:
        job_id: Job application ID
        job_update: Updated job data
        current_user_id: Current authenticated user ID
        
    Returns:
        JobResponse: Updated job application
        
    Raises:
        HTTPException: If job not found or update fails
    """
    try:
        # Update job in DynamoDB
        updated_job = await update_job(current_user_id, job_id, job_update)
        
        if not updated_job:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Job application not found"
            )
        
        return updated_job
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating job: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job application"
        )


@router.delete("/{job_id}", response_model=MessageResponse)
async def delete_job_application(
    job_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Delete a job application
    
    Args:
        job_id: Job application ID
        current_user_id: Current authenticated user ID
        
    Returns:
        MessageResponse: Success message
        
    Raises:
        HTTPException: If job not found or deletion fails
    """
    try:
        # Delete job from DynamoDB
        deleted = await delete_job(current_user_id, job_id)
        
        if not deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Job application not found"
            )
        
        return MessageResponse(
            message="Job application deleted successfully",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting job: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete job application"
        )


@router.patch("/{job_id}/status", response_model=JobResponse)
async def update_job_status(
    job_id: str,
    new_status: JobStatus,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Update only the status of a job application
    
    Args:
        job_id: Job application ID
        new_status: New job status
        current_user_id: Current authenticated user ID
        
    Returns:
        JobResponse: Updated job application
        
    Raises:
        HTTPException: If job not found or update fails
    """
    try:
        # Create update request with only status
        status_update = JobUpdateRequest(status=new_status)
        
        # Update job in DynamoDB
        updated_job = await update_job(current_user_id, job_id, status_update)
        
        if not updated_job:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Job application not found"
            )
        
        return updated_job
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating job status: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job status"
        )


@router.get("/status/{status}", response_model=List[JobResponse])
async def get_jobs_by_status(
    status: JobStatus,
    current_user_id: str = Depends(get_current_user_id),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Maximum number of jobs to return")
):
    """
    Get job applications filtered by status for the current user
    
    Args:
        status: Job status to filter by
        current_user_id: Current authenticated user ID
        limit: Optional limit on number of results
        
    Returns:
        List[JobResponse]: List of job applications with specified status
        
    Raises:
        HTTPException: If retrieval fails
    """
    try:
        # Get all user jobs and filter by status
        # Note: This could be optimized with a GSI query in the future
        all_jobs = await get_user_jobs(current_user_id, limit)
        filtered_jobs = [job for job in all_jobs if job.status == status]
        
        return filtered_jobs
        
    except Exception as e:
        print(f"Error getting jobs by status: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job applications by status"
        )


# Bulk operations
@router.post("/bulk/status-update", response_model=MessageResponse)
async def bulk_update_status(
    job_ids: List[str],
    new_status: JobStatus,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Update status for multiple job applications
    
    Args:
        job_ids: List of job IDs to update
        new_status: New status for all jobs
        current_user_id: Current authenticated user ID
        
    Returns:
        MessageResponse: Success message with count
        
    Raises:
        HTTPException: If updates fail
    """
    try:
        updated_count = 0
        failed_count = 0
        
        for job_id in job_ids:
            try:
                status_update = JobUpdateRequest(status=new_status)
                updated_job = await update_job(current_user_id, job_id, status_update)
                if updated_job:
                    updated_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                print(f"Failed to update job {job_id}: {e}")
                failed_count += 1
        
        return MessageResponse(
            message=f"Updated {updated_count} job(s), {failed_count} failed",
            success=failed_count == 0
        )
        
    except Exception as e:
        print(f"Error in bulk status update: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk status update"
        )


@router.delete("/bulk", response_model=MessageResponse)
async def bulk_delete_jobs(
    job_ids: List[str],
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Delete multiple job applications
    
    Args:
        job_ids: List of job IDs to delete
        current_user_id: Current authenticated user ID
        
    Returns:
        MessageResponse: Success message with count
        
    Raises:
        HTTPException: If deletions fail
    """
    try:
        deleted_count = 0
        failed_count = 0
        
        for job_id in job_ids:
            try:
                deleted = await delete_job(current_user_id, job_id)
                if deleted:
                    deleted_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                print(f"Failed to delete job {job_id}: {e}")
                failed_count += 1
        
        return MessageResponse(
            message=f"Deleted {deleted_count} job(s), {failed_count} failed",
            success=failed_count == 0
        )
        
    except Exception as e:
        print(f"Error in bulk delete: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk delete"
        )
