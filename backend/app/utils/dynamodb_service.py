"""
DynamoDB Repository Services

This module provides repository patterns for DynamoDB operations,
replacing the MongoDB services with DynamoDB-compatible implementations.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from app.utils.dynamodb_config import get_jobs_table, get_users_table
from app.utils.models_dynamodb import (
    JobItem, JobCreateRequest, JobUpdateRequest, JobResponse,
    UserMetadata, JobStatus
)
import uuid


class JobRepository:
    """Repository for job-related DynamoDB operations"""
    
    def __init__(self):
        self.table = get_jobs_table()
    
    async def create_job(self, user_id: str, job_request: JobCreateRequest) -> JobResponse:
        """
        Create a new job application
        
        Args:
            user_id: Cognito user ID
            job_request: Job creation request data
            
        Returns:
            JobResponse: Created job data
            
        Raises:
            Exception: If creation fails
        """
        try:
            # Create job item from request
            job_item = JobItem.from_create_request(user_id, job_request)
            
            # Save to DynamoDB
            self.table.put_item(Item=job_item.dict())
            
            # Return response model
            return job_item.to_response()
            
        except ClientError as e:
            raise Exception(f"Failed to create job: {e.response['Error']['Message']}")
    
    async def get_user_jobs(self, user_id: str, limit: Optional[int] = None) -> List[JobResponse]:
        """
        Get all jobs for a user
        
        Args:
            user_id: Cognito user ID
            limit: Optional limit on number of results
            
        Returns:
            List[JobResponse]: List of user's job applications
        """
        try:
            query_kwargs = {
                'KeyConditionExpression': Key('user_id').eq(user_id) & Key('sk').begins_with('JOB'),
                'ScanIndexForward': False  # Sort by created_at descending
            }
            
            if limit:
                query_kwargs['Limit'] = limit
            
            response = self.table.query(**query_kwargs)
            
            # Convert DynamoDB items to JobResponse objects
            jobs = []
            for item in response['Items']:
                job_item = JobItem(**item)
                jobs.append(job_item.to_response())
            
            return jobs
            
        except ClientError as e:
            raise Exception(f"Failed to get user jobs: {e.response['Error']['Message']}")
    
    async def get_job_by_id(self, user_id: str, job_id: str) -> Optional[JobResponse]:
        """
        Get a specific job by user_id and job_id
        
        Args:
            user_id: Cognito user ID
            job_id: Job ID
            
        Returns:
            Optional[JobResponse]: Job data if found, None otherwise
        """
        try:
            response = self.table.get_item(
                Key={
                    'user_id': user_id,
                    'job_id': job_id
                }
            )
            
            if 'Item' in response:
                job_item = JobItem(**response['Item'])
                return job_item.to_response()
            
            return None
            
        except ClientError as e:
            raise Exception(f"Failed to get job: {e.response['Error']['Message']}")
    
    async def update_job(self, user_id: str, job_id: str, job_update: JobUpdateRequest) -> Optional[JobResponse]:
        """
        Update an existing job application
        
        Args:
            user_id: Cognito user ID
            job_id: Job ID
            job_update: Update request data
            
        Returns:
            Optional[JobResponse]: Updated job data if found, None otherwise
        """
        try:
            # First, get the existing job
            existing_job = await self.get_job_by_id(user_id, job_id)
            if not existing_job:
                return None
            
            # Convert to JobItem for updating
            existing_item = JobItem(
                user_id=existing_job.user_id,
                job_id=existing_job.job_id,
                company=existing_job.company,
                position=existing_job.position,
                status=existing_job.status.value,
                applied_date=existing_job.applied_date.isoformat(),
                application_link=existing_job.application_link,
                salary_range=existing_job.salary_range,
                location=existing_job.location,
                job_type=existing_job.job_type.value if existing_job.job_type else None,
                job_description=existing_job.job_description,
                notes=existing_job.notes,
                interview_date=existing_job.interview_date.isoformat() if existing_job.interview_date else None,
                follow_up_date=existing_job.follow_up_date.isoformat() if existing_job.follow_up_date else None,
                created_at=existing_job.created_at.isoformat(),
                updated_at=existing_job.updated_at.isoformat()
            )
            
            # Update the item
            updated_item = existing_item.update_from_request(job_update)
            
            # Save to DynamoDB
            self.table.put_item(Item=updated_item.dict())
            
            return updated_item.to_response()
            
        except ClientError as e:
            raise Exception(f"Failed to update job: {e.response['Error']['Message']}")
    
    async def delete_job(self, user_id: str, job_id: str) -> bool:
        """
        Delete a job application
        
        Args:
            user_id: Cognito user ID
            job_id: Job ID
            
        Returns:
            bool: True if deleted, False if not found
        """
        try:
            response = self.table.delete_item(
                Key={
                    'user_id': user_id,
                    'job_id': job_id
                },
                ReturnValues='ALL_OLD'
            )
            
            return 'Attributes' in response
            
        except ClientError as e:
            raise Exception(f"Failed to delete job: {e.response['Error']['Message']}")
    
    async def get_jobs_by_status(self, status: JobStatus, limit: Optional[int] = None) -> List[JobResponse]:
        """
        Get jobs by status using Global Secondary Index
        
        Args:
            status: Job status to filter by
            limit: Optional limit on number of results
            
        Returns:
            List[JobResponse]: List of jobs with specified status
        """
        try:
            query_kwargs = {
                'IndexName': 'status-created_at-index',
                'KeyConditionExpression': Key('status').eq(status.value),
                'ScanIndexForward': False  # Sort by created_at descending
            }
            
            if limit:
                query_kwargs['Limit'] = limit
            
            response = self.table.query(**query_kwargs)
            
            # Convert DynamoDB items to JobResponse objects
            jobs = []
            for item in response['Items']:
                job_item = JobItem(**item)
                jobs.append(job_item.to_response())
            
            return jobs
            
        except ClientError as e:
            raise Exception(f"Failed to get jobs by status: {e.response['Error']['Message']}")
    
    async def get_user_job_stats(self, user_id: str) -> Dict[str, int]:
        """
        Get job application statistics for a user
        
        Args:
            user_id: Cognito user ID
            
        Returns:
            Dict[str, int]: Statistics by status
        """
        try:
            # Get all user jobs
            jobs = await self.get_user_jobs(user_id)
            
            # Count by status
            stats = {status.value: 0 for status in JobStatus}
            for job in jobs:
                stats[job.status.value] += 1
            
            # Add total count
            stats['total'] = len(jobs)
            
            return stats
            
        except Exception as e:
            raise Exception(f"Failed to get job stats: {str(e)}")


class UserRepository:
    """Repository for user metadata operations"""
    
    def __init__(self):
        self.table = get_users_table()
    
    async def create_user_metadata(self, user_id: str, email: str, username: str) -> UserMetadata:
        """
        Create user metadata record
        
        Args:
            user_id: Cognito user ID
            email: User email
            username: Username
            
        Returns:
            UserMetadata: Created user metadata
        """
        try:
            user_metadata = UserMetadata(
                user_id=user_id,
                email=email,
                username=username
            )
            
            self.table.put_item(Item=user_metadata.dict())
            
            return user_metadata
            
        except ClientError as e:
            raise Exception(f"Failed to create user metadata: {e.response['Error']['Message']}")
    
    async def get_user_metadata(self, user_id: str) -> Optional[UserMetadata]:
        """
        Get user metadata by user ID
        
        Args:
            user_id: Cognito user ID
            
        Returns:
            Optional[UserMetadata]: User metadata if found
        """
        try:
            response = self.table.get_item(
                Key={'user_id': user_id}
            )
            
            if 'Item' in response:
                return UserMetadata(**response['Item'])
            
            return None
            
        except ClientError as e:
            raise Exception(f"Failed to get user metadata: {e.response['Error']['Message']}")
    
    async def update_user_metadata(self, user_id: str, **kwargs) -> Optional[UserMetadata]:
        """
        Update user metadata
        
        Args:
            user_id: Cognito user ID
            **kwargs: Fields to update
            
        Returns:
            Optional[UserMetadata]: Updated metadata if found
        """
        try:
            # Get existing metadata
            existing = await self.get_user_metadata(user_id)
            if not existing:
                return None
            
            # Update fields
            update_data = existing.dict()
            update_data.update(kwargs)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            updated_metadata = UserMetadata(**update_data)
            
            # Save to DynamoDB
            self.table.put_item(Item=updated_metadata.dict())
            
            return updated_metadata
            
        except ClientError as e:
            raise Exception(f"Failed to update user metadata: {e.response['Error']['Message']}")
    
    async def update_last_login(self, user_id: str) -> None:
        """
        Update user's last login timestamp
        
        Args:
            user_id: Cognito user ID
        """
        try:
            now = datetime.utcnow().isoformat()
            
            self.table.update_item(
                Key={'user_id': user_id},
                UpdateExpression='SET last_login = :timestamp, updated_at = :timestamp',
                ExpressionAttributeValues={
                    ':timestamp': now
                }
            )
            
        except ClientError as e:
            # Don't raise exception for last login update failures
            print(f"Warning: Failed to update last login: {e.response['Error']['Message']}")


# Singleton instances
job_repository = JobRepository()
user_repository = UserRepository()

# Convenience functions
async def create_job(user_id: str, job_request: JobCreateRequest) -> JobResponse:
    """Create a new job application"""
    return await job_repository.create_job(user_id, job_request)

async def get_user_jobs(user_id: str, limit: Optional[int] = None) -> List[JobResponse]:
    """Get all jobs for a user"""
    return await job_repository.get_user_jobs(user_id, limit)

async def get_job_by_id(user_id: str, job_id: str) -> Optional[JobResponse]:
    """Get a specific job by ID"""
    return await job_repository.get_job_by_id(user_id, job_id)

async def update_job(user_id: str, job_id: str, job_update: JobUpdateRequest) -> Optional[JobResponse]:
    """Update an existing job"""
    return await job_repository.update_job(user_id, job_id, job_update)

async def delete_job(user_id: str, job_id: str) -> bool:
    """Delete a job application"""
    return await job_repository.delete_job(user_id, job_id)

async def get_user_job_stats(user_id: str) -> Dict[str, int]:
    """Get job statistics for a user"""
    return await job_repository.get_user_job_stats(user_id)
