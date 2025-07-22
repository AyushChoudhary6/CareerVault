"""
Simplified Working FastAPI Backend for CareerVault

This is a simplified version that works without type conflicts.
"""

from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
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
import os
import google.generativeai as genai
import PyPDF2
import io

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Gemini AI Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBeWdCT_E-wFw4ZinGb6QWZpqZnOc_Jcxc")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

# Initialize FastAPI
app = FastAPI(title="CareerVault API", version="1.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

# Helper function to extract text from uploaded files
def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text from uploaded file based on file type"""
    try:
        if filename.lower().endswith('.pdf'):
            # Handle PDF files
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        else:
            # Handle text files and other formats
            try:
                return file_content.decode('utf-8')
            except UnicodeDecodeError:
                return file_content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
        return f"Error reading file: {filename}. Please ensure it's a valid PDF or text file."

# Routes
@app.get("/")
def root():
    return {"message": "🚀 CareerVault API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running normally"}

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

@app.get("/auth/me")
def get_current_user_info(current_user_id: int = Depends(get_current_user_id)):
    """Get current user information"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = ?", (current_user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user[0],
        "username": user[1],
        "email": user[2],
        "created_at": user[3]
    }

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

# AI Career Assistant Endpoints
@app.post("/api/ai/test-analyze-resume-file")
async def analyze_resume_file(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """Analyze resume against job description using AI"""
    try:
        if not model:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Read and extract text from uploaded file
        file_content = await resume_file.read()
        filename = resume_file.filename or "document.txt"
        file_text = extract_text_from_file(file_content, filename)
        
        if not file_text or file_text.startswith("Error reading file"):
            raise HTTPException(status_code=400, detail="Could not extract text from uploaded file. Please ensure it's a valid PDF or text file.")
        
        print(f"Extracted text length: {len(file_text)} characters")  # Debug
        
        # Create an enhanced prompt for better AI analysis
        prompt = f"""
        You are an expert technical recruiter conducting an interview for a specific job position. 

        CANDIDATE'S RESUME:
        {file_text}

        EXACT JOB POSTING:
        {job_description}

        Your task is to analyze this candidate against this SPECIFIC job and create HIGHLY TARGETED interview questions.

        Provide a detailed analysis with:

        1. MATCH SCORE (0-100%): How well does this candidate fit THIS specific job?

        2. MATCHED SKILLS: Skills from the resume that directly match this job's requirements

        3. MISSING SKILLS: Critical skills mentioned in this job posting that are absent from the resume

        4. ANALYSIS SUMMARY: Your assessment of this candidate for this specific position

        5. INTERVIEW QUESTIONS: Create exactly 10 interview questions that are HIGHLY SPECIFIC to:
           - The exact company/role mentioned in the job posting
           - The specific technologies listed in this job description
           - The actual responsibilities and challenges described
           - The candidate's background and experience level
           - The industry/domain context from the job posting

        Format each interview question as:
        **QUESTION X:** [Specific question about this exact role]
        **ANSWER:** [Detailed answer showing expertise for this specific position]

        Make questions extremely specific - use actual technology names, company context, and role details from the job posting. 
        No generic questions like "tell me about yourself" or "why do you want this job".
        Focus on technical scenarios, problem-solving, and role-specific challenges.

        Example format:
        **QUESTION 1:** Based on this job's requirement for [specific technology/responsibility], how would you approach [specific scenario from job description]?
        **ANSWER:** [Detailed technical answer relevant to this exact role]
        """
        
        # Get AI response
        response = model.generate_content(prompt)
        analysis_text = response.text
        
        print(f"AI Analysis received: {len(analysis_text)} characters")  # Debug
        
        # Smart parsing with multiple extraction methods
        import re
        
        # Method 1: Extract match score
        score_patterns = [
            r'(?:match score|score|rating)[:\s]*(\d{1,3})%?',
            r'(\d{1,3})%?\s*(?:match|score|rating)',
            r'(?:i would rate|rating|score)[^0-9]*(\d{1,3})'
        ]
        
        match_score = 70  # Default
        for pattern in score_patterns:
            matches = re.findall(pattern, analysis_text.lower())
            if matches:
                potential_score = int(matches[0])
                if 0 <= potential_score <= 100:
                    match_score = potential_score
                    break
        
        # Method 2: Intelligent skill extraction
        # Extract technical skills from both resume and job description
        tech_keywords = {
            'python', 'javascript', 'java', 'c++', 'c#', 'react', 'angular', 'vue',
            'node.js', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite',
            'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
            'git', 'github', 'gitlab', 'docker', 'kubernetes', 'jenkins',
            'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify',
            'linux', 'ubuntu', 'windows', 'macos', 'bash', 'powershell',
            'api', 'rest', 'graphql', 'json', 'xml', 'yaml',
            'testing', 'jest', 'pytest', 'junit', 'selenium', 'cypress',
            'agile', 'scrum', 'kanban', 'jira', 'confluence',
            'machine learning', 'ai', 'data science', 'analytics', 'tensorflow', 'pytorch'
        }
        
        soft_skills = {
            'leadership', 'communication', 'teamwork', 'collaboration', 
            'problem solving', 'analytical thinking', 'creativity', 'adaptability',
            'time management', 'project management', 'organization', 'detail oriented'
        }
        
        # Tokenize texts for analysis
        resume_tokens = set(re.findall(r'\b\w+\b', file_text.lower()))
        job_tokens = set(re.findall(r'\b\w+\b', job_description.lower()))
        analysis_tokens = set(re.findall(r'\b\w+\b', analysis_text.lower()))
        
        # Find matched technical skills
        matched_tech = []
        for skill in tech_keywords:
            skill_parts = skill.replace('.', '').replace('-', '').split()
            if all(part in resume_tokens for part in skill_parts) and \
               any(part in job_tokens for part in skill_parts):
                matched_tech.append(skill.replace('.js', '.js').title())
        
        # Find matched soft skills
        matched_soft = []
        for skill in soft_skills:
            skill_parts = skill.split()
            if all(part in resume_tokens for part in skill_parts) and \
               any(part in job_tokens for part in skill_parts):
                matched_soft.append(skill.title())
        
        matched_skills = matched_tech + matched_soft
        
        # Find missing skills (mentioned in job but not in resume)
        missing_tech = []
        for skill in tech_keywords:
            skill_parts = skill.replace('.', '').replace('-', '').split()
            if any(part in job_tokens for part in skill_parts) and \
               not all(part in resume_tokens for part in skill_parts):
                missing_tech.append(skill.replace('.js', '.js').title())
        
        missing_soft = []
        for skill in soft_skills:
            skill_parts = skill.split()
            if any(part in job_tokens for part in skill_parts) and \
               not all(part in resume_tokens for part in skill_parts):
                missing_soft.append(skill.title())
        
        missing_skills = missing_tech + missing_soft
        
        # Adjust score based on actual skill matches
        if matched_skills and missing_skills:
            total_relevant_skills = len(matched_skills) + len(missing_skills)
            skill_match_ratio = len(matched_skills) / total_relevant_skills
            calculated_score = int(skill_match_ratio * 100)
            # Blend AI score with calculated score
            match_score = (match_score + calculated_score) // 2
        
        # Ensure reasonable limits
        match_score = max(20, min(95, match_score))
        
        # Limit arrays for UI
        matched_skills = matched_skills[:8] if matched_skills else ["Communication", "Problem Solving"]
        missing_skills = missing_skills[:6] if missing_skills else ["Industry Experience"]
        
        # Generate role-specific interview questions
        questions = generate_interview_questions(job_description, file_text, analysis_text)
        
        # Create comprehensive analysis summary
        if match_score >= 80:
            summary = f"Excellent match ({match_score}%)! The candidate demonstrates strong alignment with job requirements, showing relevant experience and key technical skills."
        elif match_score >= 65:
            summary = f"Good fit ({match_score}%). The candidate has solid relevant skills with some areas for growth or training in specific technologies."
        elif match_score >= 50:
            summary = f"Moderate fit ({match_score}%). The candidate shows potential but would need development in several key areas mentioned in the job description."
        else:
            summary = f"Limited match ({match_score}%). While the candidate may have transferable skills, significant training would be needed for this specific role."
        
        structured_response = {
            "match_score": match_score,
            "matched_keywords": matched_skills,
            "missing_keywords": missing_skills,
            "analysis_summary": summary,
            "interview_questions": questions,
            "raw_analysis": analysis_text[:1000] + "..." if len(analysis_text) > 1000 else analysis_text
        }
        
        print(f"Final structured response: {structured_response}")  # Debug
        
        return {
            "analysis": structured_response,
            "resume_filename": resume_file.filename,
            "success": True
        }
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        
        # Provide a meaningful fallback response
        fallback_response = {
            "match_score": 65,
            "matched_keywords": ["Communication", "Problem Solving", "Technical Skills"],
            "missing_keywords": ["Specific Domain Knowledge"],
            "analysis_summary": f"Analysis completed with some limitations. The candidate appears to have relevant background for the role. (Error: {str(e)[:100]})",
            "interview_questions": [
                {
                    "question": "Can you walk me through your most relevant project experience?",
                    "sample_answer": "Use the STAR method (Situation, Task, Action, Result) to describe a project that demonstrates skills relevant to this role."
                },
                {
                    "question": "How do you stay current with industry trends and technologies?",
                    "sample_answer": "Mention specific resources, communities, courses, or practices you follow for continuous learning."
                },
                {
                    "question": "What motivates you about this particular role and company?",
                    "sample_answer": "Connect your career goals with the company's mission and the growth opportunities this position offers."
                },
                {
                    "question": "Describe a challenging technical problem you solved recently.",
                    "sample_answer": "Explain the problem context, your approach to solving it, and the impact of your solution."
                },
                {
                    "question": "How do you approach working in a team environment?",
                    "sample_answer": "Discuss communication skills, collaboration methods, and how you handle conflicts or disagreements."
                },
                {
                    "question": "What development tools and practices do you prefer?",
                    "sample_answer": "Mention your preferred IDEs, version control practices, testing approaches, and development workflow."
                },
                {
                    "question": "How do you handle tight deadlines and pressure?",
                    "sample_answer": "Describe your time management strategies, prioritization methods, and how you maintain quality under pressure."
                },
                {
                    "question": "What's your approach to learning new technologies?",
                    "sample_answer": "Explain your learning methodology, resources you use, and how you apply new knowledge in projects."
                },
                {
                    "question": "Describe your experience with project management and planning.",
                    "sample_answer": "Discuss your experience with planning, estimation, tracking progress, and adapting to changes."
                },
                {
                    "question": "How do you ensure code quality in your work?",
                    "sample_answer": "Talk about coding standards, testing practices, code reviews, and documentation approaches."
                },
                {
                    "question": "What's your experience with debugging and troubleshooting?",
                    "sample_answer": "Describe your systematic approach to identifying and fixing issues, tools you use, and how you prevent similar problems."
                },
                {
                    "question": "How do you handle feedback and criticism of your work?",
                    "sample_answer": "Explain how you receive feedback positively, implement suggestions, and use criticism for professional growth."
                },
                {
                    "question": "What role do you typically take in team projects?",
                    "sample_answer": "Describe your natural role (leader, collaborator, specialist) and how you adapt to different team dynamics."
                },
                {
                    "question": "How do you balance innovation with practical constraints?",
                    "sample_answer": "Discuss how you evaluate new approaches while considering time, budget, and risk factors."
                },
                {
                    "question": "What's your approach to documentation and knowledge sharing?",
                    "sample_answer": "Explain how you document your work, share knowledge with team members, and maintain project documentation."
                },
                {
                    "question": "How do you prioritize tasks when everything seems urgent?",
                    "sample_answer": "Describe your decision-making process for prioritization, how you communicate with stakeholders, and manage expectations."
                },
                {
                    "question": "What's your experience with different development methodologies?",
                    "sample_answer": "Discuss your experience with Agile, Scrum, Waterfall, or other methodologies and their appropriate use cases."
                },
                {
                    "question": "How do you approach performance optimization in your applications?",
                    "sample_answer": "Explain your methodology for identifying bottlenecks, profiling tools you use, and optimization strategies."
                },
                {
                    "question": "What's your strategy for career growth and skill development?",
                    "sample_answer": "Outline your professional development goals, learning plans, and how this role fits into your career trajectory."
                },
                {
                    "question": "How do you contribute to a positive team culture?",
                    "sample_answer": "Describe your approach to collaboration, mentoring others, sharing knowledge, and supporting team goals."
                }
            ],
            "raw_analysis": f"Error during analysis: {str(e)}"
        }
        
        return {
            "analysis": fallback_response,
            "resume_filename": resume_file.filename or "unknown.pdf",
            "success": True
        }

def generate_interview_questions(job_description: str, resume_text: str, ai_analysis: str = ""):
    """Generate comprehensive role-specific interview questions based on job description, resume, and AI analysis"""
    job_lower = job_description.lower()
    resume_lower = resume_text.lower()
    questions = []
    
    # First, try to extract questions from AI analysis if available
    if ai_analysis:
        import re
        
        # Enhanced patterns to extract AI-generated questions and answers
        ai_questions = []
        
        # Pattern 1: **QUESTION X:** ... **ANSWER:** format
        question_answer_pattern = r'\*\*QUESTION\s*\d*[:\-\.]?\*\*\s*([^*]+?)\s*\*\*ANSWER[:\-\.]?\*\*\s*([^*]+?)(?=\*\*QUESTION|\*\*\d+\.|\Z)'
        matches = re.findall(question_answer_pattern, ai_analysis, re.IGNORECASE | re.DOTALL)
        
        for question, answer in matches:
            clean_question = question.strip()
            clean_answer = answer.strip()
            if len(clean_question) > 10 and len(clean_answer) > 10:
                ai_questions.append({
                    "question": clean_question,
                    "sample_answer": clean_answer
                })
        
        # Pattern 2: Numbered questions with answers
        if not ai_questions:
            numbered_pattern = r'(\d+\.?\s*[^?]+\?)\s*([^0-9]+?)(?=\d+\.|\Z)'
            numbered_matches = re.findall(numbered_pattern, ai_analysis, re.DOTALL)
            
            for question, answer in numbered_matches:
                clean_question = re.sub(r'^\d+\.?\s*', '', question.strip())
                clean_answer = answer.strip()
                if len(clean_question) > 10 and len(clean_answer) > 10:
                    ai_questions.append({
                        "question": clean_question,
                        "sample_answer": clean_answer[:300] + "..." if len(clean_answer) > 300 else clean_answer
                    })
        
        # Pattern 3: Simple question-answer pairs
        if not ai_questions:
            simple_pattern = r'([^.!?]*\?)\s*([^?]+?)(?=[^.!?]*\?|\Z)'
            simple_matches = re.findall(simple_pattern, ai_analysis, re.DOTALL)
            
            for question, answer in simple_matches[:10]:
                clean_question = question.strip()
                clean_answer = answer.strip()
                if len(clean_question) > 20 and len(clean_answer) > 20:
                    ai_questions.append({
                        "question": clean_question,
                        "sample_answer": clean_answer[:250] + "..." if len(clean_answer) > 250 else clean_answer
                    })
        
        # Add AI questions to the main list
        questions.extend(ai_questions[:10])
        
        print(f"Extracted {len(ai_questions)} AI-generated questions")  # Debug
    
    # Enhanced job-specific question generation based on actual job content
    job_words = set(word.lower().strip('.,!?()[]{}":;') for word in job_description.split())
    resume_words = set(word.lower().strip('.,!?()[]{}":;') for word in resume_text.split())
    
    # Extract specific details from job description
    company_name = extract_company_name(job_description)
    role_title = extract_role_title(job_description)
    specific_technologies = extract_technologies(job_description)
    business_domain = extract_domain_context(job_description)
    
    print(f"Extracted context - Company: {company_name}, Role: {role_title}, Tech: {specific_technologies}, Domain: {business_domain}")
    
    # Generate highly specific questions based on job content
    role_questions = []
    
    # Technology-specific questions using actual job details
    if any(tech in job_words for tech in ['python', 'django', 'flask']):
        if 'django' in job_words:
            role_questions.append({
                "question": f"This {role_title} position at {company_name} requires Django development for {business_domain}. How would you structure a Django application to handle the specific requirements mentioned in this role?",
                "sample_answer": f"For a {business_domain} application, I would organize Django with separate apps for different business domains, implement proper models with relationships, create robust APIs with Django REST Framework, add comprehensive testing, and ensure security best practices for {business_domain} compliance."
            })
        
        if any(word in job_words for word in ['api', 'rest', 'backend']):
            role_questions.append({
                "question": f"In this {role_title} role, you'll be building APIs for {business_domain}. How would you design and implement scalable REST APIs using the technology stack mentioned in this job posting?",
                "sample_answer": f"I would design RESTful endpoints following industry standards, implement proper authentication and authorization, use database optimization techniques, add comprehensive error handling, implement rate limiting, and ensure the APIs meet {business_domain} specific requirements for security and performance."
            })
    
    if any(tech in job_words for tech in ['react', 'frontend', 'javascript']):
        role_questions.append({
            "question": f"This {role_title} position involves React development. Based on the requirements in this job posting, how would you approach building the frontend components for {business_domain} applications?",
            "sample_answer": f"I would create reusable React components, implement state management appropriate for {business_domain} workflows, ensure responsive design, optimize performance with code splitting, add comprehensive testing, and follow accessibility guidelines relevant to {business_domain} users."
        })
    
    if any(db in job_words for db in ['postgresql', 'mysql', 'mongodb', 'database']):
        db_mentioned = next((db for db in ['postgresql', 'mysql', 'mongodb'] if db in job_words), 'database')
        role_questions.append({
            "question": f"This role requires {db_mentioned} expertise for {business_domain} applications. How would you design and optimize the database architecture for the specific use cases mentioned in this job description?",
            "sample_answer": f"I would analyze the {business_domain} data requirements, design normalized schemas with proper relationships, create indexes for performance optimization, implement backup and recovery strategies, ensure data security compliance, and use {db_mentioned}-specific features for optimal performance."
        })
    
    if any(cloud in job_words for cloud in ['aws', 'azure', 'gcp', 'cloud']):
        cloud_platform = next((cloud for cloud in ['aws', 'azure', 'gcp'] if cloud in job_words), 'cloud platforms')
        role_questions.append({
            "question": f"This {role_title} position involves {cloud_platform} deployment for {business_domain} applications. How would you architect and deploy the system described in this job posting?",
            "sample_answer": f"I would use {cloud_platform} services like compute instances, managed databases, storage solutions, and load balancers to create a scalable architecture. I'd implement CI/CD pipelines, monitoring, and security best practices specific to {business_domain} compliance requirements."
        })
    
    # Experience level and responsibility questions
    if any(level in job_words for level in ['senior', 'lead', 'principal']):
        role_questions.append({
            "question": f"As a {role_title} at {company_name}, how would you approach technical leadership and mentoring in the context of {business_domain} development?",
            "sample_answer": f"I would provide technical guidance specific to {business_domain} challenges, conduct code reviews focusing on industry best practices, mentor team members on the technologies mentioned in this role, and help establish development standards that align with {company_name}'s goals and {business_domain} requirements."
        })
    
    # Industry and domain-specific questions
    if business_domain != "the business domain":
        role_questions.append({
            "question": f"What specific challenges do you anticipate in developing software for {business_domain}, and how would your experience help {company_name} address these challenges?",
            "sample_answer": f"In {business_domain}, key challenges include [specific to domain like security for fintech, scalability for e-commerce, compliance for healthcare]. My experience with the technologies mentioned in this role would help address these by implementing industry-standard solutions and best practices."
        })
    
    # Problem-solving questions based on job context
    if any(word in job_words for word in ['scale', 'performance', 'optimization']):
        role_questions.append({
            "question": f"This {role_title} role emphasizes scalability and performance. How would you identify and resolve performance bottlenecks in the {business_domain} applications described in this job posting?",
            "sample_answer": f"I would use profiling tools to identify bottlenecks, optimize database queries, implement caching strategies, optimize frontend performance, monitor system metrics, and apply {business_domain}-specific optimization techniques to ensure the application meets the performance requirements mentioned in the role."
        })
    
    # Security questions for sensitive domains
    if any(word in job_words for word in ['security', 'compliance', 'financial', 'healthcare', 'payment']):
        role_questions.append({
            "question": f"Security is crucial in this {role_title} position for {business_domain}. How would you implement security measures for the applications and systems described in this job posting?",
            "sample_answer": f"I would implement multi-layered security including secure authentication, data encryption, input validation, secure coding practices, regular security audits, and compliance with {business_domain}-specific regulations and standards mentioned in the job requirements."
        })
    
    # Team collaboration and process questions
    if any(word in job_words for word in ['agile', 'scrum', 'team', 'collaboration']):
        role_questions.append({
            "question": f"This {role_title} role involves working in a collaborative environment at {company_name}. How would you contribute to the team dynamics and development processes for {business_domain} projects?",
            "sample_answer": f"I would actively participate in agile ceremonies, provide constructive code reviews, share knowledge about the technologies used in this role, collaborate effectively with cross-functional teams, and contribute to improving development processes specific to {business_domain} projects."
        })
    
    # Combine AI questions with generated questions, prioritizing AI ones
    final_questions = questions[:10] + role_questions[:10]
    
    # Remove duplicates and ensure variety
    seen_questions = set()
    unique_questions = []
    
    for q in final_questions:
        question_key = q['question'].lower().strip()
        if question_key not in seen_questions and len(question_key) > 20:
            seen_questions.add(question_key)
            unique_questions.append(q)
            if len(unique_questions) >= 20:
                break
    
    # Fill with fallback questions if needed
    if len(unique_questions) < 20:
        fallback_questions = get_fallback_questions(job_description, resume_text)
        for q in fallback_questions:
            if len(unique_questions) >= 20:
                break
            question_key = q['question'].lower().strip()
            if question_key not in seen_questions:
                seen_questions.add(question_key)
                unique_questions.append(q)
    
    return unique_questions[:20]

def extract_company_name(job_description: str) -> str:
    """Extract company name from job description"""
    import re
    
    # Look for common patterns like "at [Company]", "[Company] is looking", etc.
    patterns = [
        r'at\s+([A-Z][a-zA-Z\s&]+?)(?:\s+is|\s+we|\s+looking|\s+seeks|\.|,)',
        r'([A-Z][a-zA-Z\s&]+?)\s+is\s+(?:looking|seeking|hiring)',
        r'join\s+([A-Z][a-zA-Z\s&]+?)(?:\s+as|\s+team|\.|,)',
        r'([A-Z][a-zA-Z\s&]+?)\s+team',
        r'([A-Z][a-zA-Z\s&]+?)\s+(?:company|corporation|inc|ltd)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, job_description, re.IGNORECASE)
        if match:
            company = match.group(1).strip()
            if len(company) > 2 and company.lower() not in ['the', 'our', 'this', 'that']:
                return company
    
    return "our company"

def extract_role_title(job_description: str) -> str:
    """Extract role title from job description"""
    import re
    
    # Look for role titles in the first few lines
    first_lines = job_description.split('\n')[:3]
    
    for line in first_lines:
        # Common role patterns
        role_patterns = [
            r'(senior|junior|lead|principal)?\s*(?:software|full.?stack|backend|frontend|web|mobile)?\s*(?:developer|engineer|programmer)',
            r'(senior|junior|lead|principal)?\s*(?:devops|data|ml|ai)\s*(?:engineer|scientist|developer)',
            r'(senior|junior|lead|principal)?\s*(?:product|project)\s*manager',
            r'(senior|junior|lead|principal)?\s*(?:qa|test)\s*(?:engineer|analyst)'
        ]
        
        for pattern in role_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                return match.group(0).strip().title()
    
    # Fallback: look for the first line that might be a title
    for line in first_lines:
        if len(line.strip()) > 5 and len(line.strip()) < 50:
            return line.strip()
    
    return "this position"

def extract_technologies(job_description: str) -> list:
    """Extract specific technologies mentioned in job description"""
    import re
    
    tech_keywords = [
        'python', 'javascript', 'typescript', 'java', 'c#', 'php', 'ruby', 'go',
        'react', 'angular', 'vue', 'django', 'flask', 'express', 'spring',
        'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
        'git', 'github', 'gitlab', 'jira', 'confluence'
    ]
    
    job_lower = job_description.lower()
    found_tech = []
    
    for tech in tech_keywords:
        if re.search(r'\b' + re.escape(tech.lower()) + r'\b', job_lower):
            found_tech.append(tech.title())
    
    return found_tech

def extract_domain_context(job_description: str) -> str:
    """Extract business domain context from job description"""
    domains = {
        'e-commerce': ['ecommerce', 'e-commerce', 'shopping', 'retail', 'marketplace'],
        'fintech': ['fintech', 'financial', 'banking', 'payment', 'trading'],
        'healthcare': ['healthcare', 'medical', 'hospital', 'patient'],
        'education': ['education', 'learning', 'student', 'course'],
        'social media': ['social', 'media', 'content', 'feed'],
        'logistics': ['logistics', 'shipping', 'delivery', 'transport']
    }
    
    job_lower = job_description.lower()
    for domain, keywords in domains.items():
        if any(keyword in job_lower for keyword in keywords):
            return domain
    return "the business domain"

def extract_business_context(job_description: str) -> str:
    """Extract business context for API questions"""
    if 'user' in job_description.lower():
        return "user management and authentication"
    elif 'product' in job_description.lower():
        return "product catalog and inventory"
    elif 'payment' in job_description.lower():
        return "payment processing and transactions"
    else:
        return "the core business functionality"

def extract_ui_context(job_description: str) -> str:
    """Extract UI context from job description"""
    ui_contexts = {
        'dashboard': ['dashboard', 'analytics', 'metrics'],
        'user profile': ['profile', 'account', 'settings'],
        'data visualization': ['chart', 'graph', 'visualization', 'report'],
        'form': ['form', 'input', 'registration', 'submit']
    }
    
    job_lower = job_description.lower()
    for context, keywords in ui_contexts.items():
        if any(keyword in job_lower for keyword in keywords):
            return context
    return "interactive user interface"

def extract_project_context(job_description: str) -> str:
    """Extract project context from job description"""
    if 'feature' in job_description.lower():
        return "new feature development"
    elif 'platform' in job_description.lower():
        return "platform development"
    elif 'product' in job_description.lower():
        return "product development"
    else:
        return "project development"

def extract_application_context(job_description: str) -> str:
    """Extract application context from job description"""
    if 'web application' in job_description.lower():
        return "web applications"
    elif 'mobile' in job_description.lower():
        return "mobile applications"
    elif 'platform' in job_description.lower():
        return "the platform"
    else:
        return "applications"

def extract_company_context(job_description: str) -> str:
    """Extract company/industry context from job description"""
    contexts = {
        'startup environment': ['startup', 'fast-paced', 'growing'],
        'enterprise software': ['enterprise', 'corporate', 'large-scale'],
        'healthcare technology': ['healthcare', 'medical', 'patient'],
        'financial services': ['financial', 'fintech', 'banking'],
        'e-commerce': ['ecommerce', 'retail', 'shopping']
    }
    
    job_lower = job_description.lower()
    for context, keywords in contexts.items():
        if any(keyword in job_lower for keyword in keywords):
            return context
    return "this industry"

def get_fallback_questions(job_description: str, resume_text: str) -> list:
    """Generate fallback questions when AI parsing fails"""
    return [
        {
            "question": "Walk me through your approach to solving a complex technical problem in your previous role.",
            "sample_answer": "I would break down the problem into smaller components, research possible solutions, create a proof of concept, collaborate with team members for feedback, and implement with proper testing and documentation."
        },
        {
            "question": "How do you ensure code quality and maintainability in your projects?",
            "sample_answer": "I follow coding standards, write comprehensive tests, conduct thorough code reviews, use linting tools, document my code properly, and refactor regularly to improve readability and performance."
        },
        {
            "question": "Describe your experience with the development lifecycle in your previous positions.",
            "sample_answer": "I've worked with agile methodologies, participated in sprint planning and retrospectives, collaborated with designers and product managers, and followed CI/CD practices for deployment."
        }
    ]

@app.post("/api/ai/career-advice")
async def get_career_advice(request: dict):
    """Get AI-powered career advice"""
    try:
        if not model:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        query = request.get("query", "")
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        prompt = f"""
        As a professional career advisor, please provide helpful and actionable advice for the following career question:

        {query}

        Please provide specific, practical advice that the person can implement.
        """
        
        response = model.generate_content(prompt)
        advice = response.text
        
        return {
            "advice": advice,
            "success": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get career advice: {str(e)}")

@app.post("/api/ai/analyze-job-description")
async def analyze_job_description(request: dict):
    """Analyze job description and provide insights"""
    try:
        if not model:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        job_description = request.get("job_description", "")
        if not job_description:
            raise HTTPException(status_code=400, detail="Job description is required")
        
        prompt = f"""
        Please analyze this job description and provide insights:

        {job_description}

        Please provide:
        1. Key skills and qualifications required
        2. Nice-to-have skills
        3. Company culture indicators
        4. Salary expectations (if mentioned)
        5. Growth opportunities
        6. Red flags (if any)
        
        Format as a structured analysis.
        """
        
        response = model.generate_content(prompt)
        analysis = response.text
        
        return {
            "analysis": analysis,
            "success": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
