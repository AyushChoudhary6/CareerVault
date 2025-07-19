"""
Simplified Working FastAPI Backend for CareerVault

This is a simplified version that works without type conflicts.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
import sqlite3
import hashlib
import secrets

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize FastAPI
app = FastAPI(title="CareerVault API", version="1.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database setup
def init_db():
    conn = sqlite3.connect('job_tracker.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Jobs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            company TEXT NOT NULL,
            position TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Applied',
            applied_date TEXT NOT NULL,
            application_link TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic Models
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class JobCreate(BaseModel):
    company: str
    position: str
    status: str = "Applied"
    applied_date: str
    application_link: Optional[str] = None
    notes: Optional[str] = None

class JobUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[str] = None
    application_link: Optional[str] = None
    notes: Optional[str] = None

class JobResponse(BaseModel):
    id: int
    company: str
    position: str
    status: str
    applied_date: str
    application_link: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Database helper functions
def get_db_connection():
    return sqlite3.connect('job_tracker.db')

def get_user_by_email(email: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_user_by_username(username: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def create_user(username: str, email: str, hashed_password: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)",
        (username, email, hashed_password)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return user_id

# Routes
@app.get("/")
def root():
    return {"message": "🚀 CareerVault API is running!", "version": "1.0.0"}

@app.post("/auth/signup")
def signup(user: UserSignup):
    # Check if user exists
    if get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed_password = hash_password(user.password)
    user_id = create_user(user.username, user.email, hashed_password)
    
    return {"message": "User created successfully", "user_id": user_id}

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin):
    # Get user
    db_user = get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user[3]):  # db_user[3] is hashed_password
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(data={"user_id": db_user[0], "email": db_user[2]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/jobs", response_model=JobResponse)
def create_job(job: JobCreate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO jobs (user_id, company, position, status, applied_date, application_link, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (current_user_id, job.company, job.position, job.status, job.applied_date, job.application_link, job.notes))
    
    job_id = cursor.lastrowid
    conn.commit()
    
    # Get the created job
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    created_job = cursor.fetchone()
    conn.close()
    
    return JobResponse(
        id=created_job[0],
        company=created_job[2],
        position=created_job[3],
        status=created_job[4],
        applied_date=created_job[5],
        application_link=created_job[6],
        notes=created_job[7],
        created_at=created_job[8],
        updated_at=created_job[9]
    )

@app.get("/api/jobs", response_model=List[JobResponse])
def get_jobs(current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC", (current_user_id,))
    jobs = cursor.fetchall()
    conn.close()
    
    return [
        JobResponse(
            id=job[0],
            company=job[2],
            position=job[3],
            status=job[4],
            applied_date=job[5],
            application_link=job[6],
            notes=job[7],
            created_at=job[8],
            updated_at=job[9]
        ) for job in jobs
    ]

@app.get("/api/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = ? AND user_id = ?", (job_id, current_user_id))
    job = cursor.fetchone()
    conn.close()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResponse(
        id=job[0],
        company=job[2],
        position=job[3],
        status=job[4],
        applied_date=job[5],
        application_link=job[6],
        notes=job[7],
        created_at=job[8],
        updated_at=job[9]
    )

@app.put("/api/jobs/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_update: JobUpdate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if job exists and belongs to user
    cursor.execute("SELECT * FROM jobs WHERE id = ? AND user_id = ?", (job_id, current_user_id))
    existing_job = cursor.fetchone()
    
    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Build update query
    update_fields = []
    update_values = []
    
    if job_update.company is not None:
        update_fields.append("company = ?")
        update_values.append(job_update.company)
    
    if job_update.position is not None:
        update_fields.append("position = ?")
        update_values.append(job_update.position)
    
    if job_update.status is not None:
        update_fields.append("status = ?")
        update_values.append(job_update.status)
    
    if job_update.applied_date is not None:
        update_fields.append("applied_date = ?")
        update_values.append(job_update.applied_date)
    
    if job_update.application_link is not None:
        update_fields.append("application_link = ?")
        update_values.append(job_update.application_link)
    
    if job_update.notes is not None:
        update_fields.append("notes = ?")
        update_values.append(job_update.notes)
    
    if update_fields:
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        update_values.append(job_id)
        update_values.append(current_user_id)
        
        query = f"UPDATE jobs SET {', '.join(update_fields)} WHERE id = ? AND user_id = ?"
        cursor.execute(query, update_values)
        conn.commit()
    
    # Get updated job
    cursor.execute("SELECT * FROM jobs WHERE id = ? AND user_id = ?", (job_id, current_user_id))
    updated_job = cursor.fetchone()
    conn.close()
    
    return JobResponse(
        id=updated_job[0],
        company=updated_job[2],
        position=updated_job[3],
        status=updated_job[4],
        applied_date=updated_job[5],
        application_link=updated_job[6],
        notes=updated_job[7],
        created_at=updated_job[8],
        updated_at=updated_job[9]
    )

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if job exists and belongs to user
    cursor.execute("SELECT * FROM jobs WHERE id = ? AND user_id = ?", (job_id, current_user_id))
    existing_job = cursor.fetchone()
    
    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Delete job
    cursor.execute("DELETE FROM jobs WHERE id = ? AND user_id = ?", (job_id, current_user_id))
    conn.commit()
    conn.close()
    
    return {"message": "Job deleted successfully"}

@app.get("/api/jobs/stats/summary")
def get_job_stats(current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all jobs for user
    cursor.execute("SELECT status FROM jobs WHERE user_id = ?", (current_user_id,))
    jobs = cursor.fetchall()
    
    # Calculate stats
    total_jobs = len(jobs)
    status_counts = {}
    
    for job in jobs:
        status = job[0]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Calculate success rate
    offers = status_counts.get('Offer', 0)
    success_rate = round((offers / total_jobs) * 100, 2) if total_jobs > 0 else 0
    
    conn.close()
    
    return {
        "total_applications": total_jobs,
        "status_breakdown": status_counts,
        "success_rate": success_rate
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
