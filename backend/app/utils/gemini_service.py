"""
Gemini AI Career Assistant Service

This service integrates with Google's Gemini AI to provide:
1. Resume-Job Description analysis
2. Keyword matching
3. Interview question generation with personalized answers
"""

import os
import json
import re
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("⚠️ WARNING: GEMINI_API_KEY not found in environment variables!")
    print("⚠️ Please check your .env file and ensure GEMINI_API_KEY is set.")
else:
    print(f"✅ Gemini API key loaded successfully (length: {len(GEMINI_API_KEY)})")

genai.configure(api_key=GEMINI_API_KEY)

class InterviewQuestion(BaseModel):
    question: str
    sample_answer: str

class CareerAnalysis(BaseModel):
    matched_keywords: List[str]
    missing_keywords: List[str]
    interview_questions: List[InterviewQuestion]
    match_score: float
    analysis_summary: str

class GeminiCareerService:
    def __init__(self):
        if not GEMINI_API_KEY:
            print("❌ GEMINI_API_KEY not found! AI analysis will not work.")
            self.model = None
        else:
            try:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                print("✅ Gemini AI model initialized successfully")
            except Exception as e:
                print(f"❌ Failed to initialize Gemini model: {str(e)}")
                self.model = None
        
    def analyze_resume_job_match(self, resume_text: str, job_description: str) -> CareerAnalysis:
        """
        Analyze resume against job description and generate career insights
        """
        print(f"🤖 Starting Gemini analysis...")
        print(f"📄 Resume length: {len(resume_text)} characters")
        print(f"💼 Job description length: {len(job_description)} characters")
        
        # Check if Gemini model is available
        if not self.model:
            print("❌ Gemini model not available - API key missing or invalid")
            return self._create_emergency_fallback()
        
        try:
            prompt = self._create_analysis_prompt(resume_text, job_description)
            print(f"🔄 Sending request to Gemini API...")
            print(f"📋 Prompt length: {len(prompt)} characters")
            
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            print(f"✅ Received response from Gemini API")
            print(f"📝 Response length: {len(result_text)} characters")
            print(f"📄 First 200 chars: {result_text[:200]}...")
            
            # Parse the JSON response
            analysis_data = self._parse_gemini_response(result_text)
            print(f"🎯 Successfully parsed Gemini response")
            
            return CareerAnalysis(**analysis_data)
            
        except Exception as e:
            print(f"❌ Main Gemini analysis failed: {str(e)}")
            print(f"❌ Error type: {type(e).__name__}")
            print(f"🔄 Trying simplified analysis...")
            # Try a simplified prompt if the main one fails
            return self._create_simplified_analysis(resume_text, job_description)
    
    def _create_analysis_prompt(self, resume_text: str, job_description: str) -> str:
        """Create the prompt for Gemini AI analysis"""
        return f"""
You are an intelligent career assistant that helps users prepare for job applications.

The user has provided their resume and a job description. Your task is to:

1. Analyze the job description and extract **key skills, technologies, and keywords** the employer is looking for.
2. Compare these keywords with the user's resume and identify:
   - ✅ Matched keywords (skills/experience already in resume).
   - ❌ Missing keywords (skills in JD but not in resume).
3. Generate a list of **10 likely interview questions** based on the job description.
4. Provide **ideal sample answers** for each question, tailored specifically to the user's resume content.
5. Calculate a match score (0-100) based on keyword overlap.
6. Provide a brief analysis summary.

**Resume Text:**
{resume_text}

**Job Description Text:**
{job_description}

IMPORTANT INSTRUCTIONS:
- Generate interview questions that are SPECIFIC to this job description
- Create sample answers that are PERSONALIZED based on the actual resume content
- Do NOT use generic or template responses
- Reference specific skills, experiences, and achievements from the resume
- Tailor answers to match the job requirements

Return the result in the following JSON format (ensure valid JSON):

{{
  "matched_keywords": ["extract actual skills from resume that match job"],
  "missing_keywords": ["identify skills mentioned in job but not in resume"],
  "match_score": [calculate based on actual keyword overlap],
  "analysis_summary": "Provide detailed analysis of how well the resume matches this specific job",
  "interview_questions": [
    {{
      "question": "Generate job-specific question based on the actual job requirements",
      "sample_answer": "Create personalized answer using actual experiences and skills from the resume"
    }}
  ]
}}

Generate exactly 10 interview questions. Each answer must reference specific details from the provided resume.

IMPORTANT: Return only valid JSON, no additional text or formatting.
"""

    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and validate Gemini response"""
        try:
            # Clean the response text
            cleaned_text = response_text.strip()
            
            # Remove any markdown formatting
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text.replace("```json", "").replace("```", "").strip()
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text.replace("```", "").strip()
            
            # Parse JSON
            data = json.loads(cleaned_text)
            
            # Validate required fields
            required_fields = ["matched_keywords", "missing_keywords", "interview_questions"]
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"Missing required field: {field}")
            
            # Ensure we have reasonable defaults
            if "match_score" not in data:
                # Calculate match score based on keyword overlap
                total_keywords = len(data["matched_keywords"]) + len(data["missing_keywords"])
                if total_keywords > 0:
                    data["match_score"] = (len(data["matched_keywords"]) / total_keywords) * 100
                else:
                    data["match_score"] = 0.0
            
            if "analysis_summary" not in data:
                data["analysis_summary"] = "Analysis completed successfully."
            
            return data
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
        except Exception as e:
            raise ValueError(f"Error parsing Gemini response: {e}")
    
    def _create_simplified_analysis(self, resume_text: str, job_description: str) -> CareerAnalysis:
        """Create a simplified analysis using Gemini when the main prompt fails"""
        print("🔄 Attempting simplified Gemini analysis...")
        
        # Check if model is available
        if not self.model:
            print("❌ Gemini model not available for simplified analysis")
            return self._create_emergency_fallback()
            
        try:
            simplified_prompt = f"""
You are a career assistant. Analyze this resume and job description:

RESUME: {resume_text[:1000]}

JOB: {job_description[:500]}

Respond with valid JSON only:
{{
  "matched_keywords": ["skill1", "skill2"],
  "missing_keywords": ["missing1", "missing2"], 
  "match_score": 75,
  "analysis_summary": "Brief analysis here",
  "interview_questions": [
    {{"question": "Tell me about your experience with [specific skill from resume]", "sample_answer": "Based on my experience with [reference actual resume content]..."}}
  ]
}}
"""
            
            print("🔄 Sending simplified request to Gemini...")
            response = self.model.generate_content(simplified_prompt)
            
            print(f"✅ Received simplified response: {len(response.text)} chars")
            print(f"📄 First 200 chars: {response.text[:200]}...")
            
            analysis_data = self._parse_gemini_response(response.text)
            print("✅ Successfully parsed simplified response")
            return CareerAnalysis(**analysis_data)
            
        except Exception as e:
            print(f"❌ Simplified analysis failed: {str(e)}")
            print(f"❌ Error type: {type(e).__name__}")
            # Only use hardcoded as last resort
            return self._create_emergency_fallback()

    def _create_emergency_fallback(self) -> CareerAnalysis:
        """Emergency fallback when all AI methods fail - generate minimal dynamic content"""
        print("🚨 Creating emergency fallback - AI generation failed")
        
        # Even in emergency, try to be somewhat dynamic
        return CareerAnalysis(
            matched_keywords=["General Skills"],
            missing_keywords=["Specific technical analysis unavailable"],
            match_score=0.0,
            analysis_summary="Unable to complete AI analysis. Please ensure you have uploaded a valid resume file and provided a detailed job description. Check your internet connection and try again.",
            interview_questions=[
                InterviewQuestion(
                    question="Could you walk me through your background and experience?",
                    sample_answer="I would highlight the key experiences and skills from my background that are most relevant to this position."
                ),
                InterviewQuestion(
                    question="What specifically interests you about this opportunity?",
                    sample_answer="I would discuss how this role aligns with my career goals and how I can contribute to the organization."
                ),
                InterviewQuestion(
                    question="How would you approach the main responsibilities of this role?",
                    sample_answer="I would outline my systematic approach and relevant experience for handling the key aspects of this position."
                )
            ]
        )

# Create a singleton instance
gemini_service = GeminiCareerService()
