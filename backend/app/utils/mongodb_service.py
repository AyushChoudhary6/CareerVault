"""
MongoDB Service Layer

This module handles all database operations for MongoDB using Beanie ODM.
"""

from datetime import datetime, date
from typing import Optional, List
from bson import ObjectId

from .models_mongo import User, Job, UserSignup, JobCreate, JobUpdate
from .security import hash_password


class UserService:
    """Service for user-related database operations"""
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email"""
        return await User.find_one(User.email == email)
    
    @staticmethod
    async def get_user_by_username(username: str) -> Optional[User]:
        """Get user by username"""
        return await User.find_one(User.username == username)
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            return await User.get(ObjectId(user_id))
        except:
            return None
    
    @staticmethod
    async def create_user(user_data: UserSignup) -> User:
        """Create a new user"""
        # Hash the password
        hashed_password = hash_password(user_data.password)
        
        # Create user document
        user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_active=True
        )
        
        # Save to database
        await user.insert()
        return user


class JobService:
    """Service for job-related database operations"""
    
    @staticmethod
    async def get_jobs_by_user(user_id: str) -> List[Job]:
        """Get all jobs for a user"""
        try:
            return await Job.find(Job.user_id == user_id).to_list()
        except:
            return []
    
    @staticmethod
    async def get_job_by_id(job_id: str, user_id: str) -> Optional[Job]:
        """Get a specific job by ID for a user"""
        try:
            job_obj_id = ObjectId(job_id)
            return await Job.find_one(Job.id == job_obj_id, Job.user_id == user_id)
        except:
            return None
    
    @staticmethod
    async def create_job(job_data: JobCreate, user_id: str) -> Job:
        """Create a new job application"""
        try:
            # Convert dates to proper format if needed
            applied_date = job_data.applied_date
            if isinstance(applied_date, date) and not isinstance(applied_date, datetime):
                # Convert date to datetime (start of day)
                applied_date = datetime.combine(applied_date, datetime.min.time())
            
            interview_date = job_data.interview_date
            if interview_date and isinstance(interview_date, date) and not isinstance(interview_date, datetime):
                interview_date = datetime.combine(interview_date, datetime.min.time())
                
            follow_up_date = job_data.follow_up_date
            if follow_up_date and isinstance(follow_up_date, date) and not isinstance(follow_up_date, datetime):
                follow_up_date = datetime.combine(follow_up_date, datetime.min.time())
            
            print(f"Processing dates - applied: {applied_date} (type: {type(applied_date)})")
            
            # Create job document with explicit field assignment
            job_dict = {
                "user_id": user_id,
                "company": job_data.company,
                "position": job_data.position,
                "status": job_data.status,
                "applied_date": applied_date,
                "application_link": job_data.application_link,
                "notes": job_data.notes,
                "salary_range": job_data.salary_range,
                "location": job_data.location,
                "job_type": job_data.job_type,
                "interview_date": interview_date,
                "follow_up_date": follow_up_date,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Create job using dict
            job = Job(**job_dict)
            
            # Save to database
            await job.insert()
            return job
        except Exception as e:
            print(f"Error in create_job service: {e}")
            print(f"Job data type applied_date: {type(job_data.applied_date)}")
            print(f"Job data applied_date value: {job_data.applied_date}")
            import traceback
            traceback.print_exc()
            raise e
    
    @staticmethod
    async def update_job(job_id: str, user_id: str, update_data: JobUpdate) -> Optional[Job]:
        """Update job application"""
        try:
            job_obj_id = ObjectId(job_id)
            
            job = await Job.find_one(Job.id == job_obj_id, Job.user_id == user_id)
            if job:
                # Only update fields that are provided
                update_dict = {}
                for field, value in update_data.dict(exclude_unset=True).items():
                    if value is not None:
                        update_dict[field] = value
                
                update_dict["updated_at"] = datetime.utcnow()
                
                await job.update({"$set": update_dict})
                return await Job.find_one(Job.id == job_obj_id, Job.user_id == user_id)
            return None
        except:
            return None
    
    @staticmethod
    async def delete_job(job_id: str, user_id: str) -> bool:
        """Delete job application"""
        try:
            job_obj_id = ObjectId(job_id)
            
            job = await Job.find_one(Job.id == job_obj_id, Job.user_id == user_id)
            if job:
                await job.delete()
                return True
            return False
        except:
            return False
    
    @staticmethod
    async def get_job_stats(user_id: str) -> dict:
        """Get job application statistics for a user"""
        try:
            jobs = await Job.find(Job.user_id == user_id).to_list()
            
            total_jobs = len(jobs)
            if total_jobs == 0:
                return {
                    "total_jobs": 0,
                    "total_applied": 0,
                    "total_interviews": 0,
                    "total_offers": 0,
                    "total_rejected": 0,
                    "application_rate": 0.0,
                    "success_rate": 0.0
                }
            
            # Count by status
            status_counts = {}
            for job in jobs:
                status = job.status
                status_counts[status] = status_counts.get(status, 0) + 1
            
            total_applied = status_counts.get("Applied", 0)
            total_interviews = status_counts.get("Interview", 0)
            total_offers = status_counts.get("Offer", 0)
            total_rejected = status_counts.get("Rejected", 0)
            
            # Calculate rates
            success_rate = (total_offers / total_jobs) * 100 if total_jobs > 0 else 0
            
            # Simple application rate (could be enhanced with time-based calculations)
            application_rate = total_jobs  # jobs per period
            
            return {
                "total_jobs": total_jobs,
                "total_applied": total_applied,
                "total_interviews": total_interviews,
                "total_offers": total_offers,
                "total_rejected": total_rejected,
                "application_rate": application_rate,
                "success_rate": round(success_rate, 2)
            }
        except:
            return {
                "total_jobs": 0,
                "total_applied": 0,
                "total_interviews": 0,
                "total_offers": 0,
                "total_rejected": 0,
                "application_rate": 0.0,
                "success_rate": 0.0
            }
