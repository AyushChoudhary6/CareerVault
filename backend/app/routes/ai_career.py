from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from pydantic import BaseModel
from typing import List, Optional
import io
import os

# Optional imports with error handling
try:
    import fitz  # PyMuPDF for PDF processing
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    fitz = None
    print("⚠️ PyMuPDF not available. PDF processing will be disabled.")

try:
    from PIL import Image
    IMAGE_AVAILABLE = True
except ImportError:
    IMAGE_AVAILABLE = False
    Image = None
    print("⚠️ Pillow not available. Image processing will be disabled.")

try:
    import pytesseract  # For OCR
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    pytesseract = None
    print("⚠️ pytesseract not available. OCR processing will be disabled.")

try:
    from docx import Document  # For Word documents
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    Document = None
    print("⚠️ python-docx not available. Word document processing will be disabled.")

from ..utils.gemini_service import GeminiCareerService
from ..utils.security import get_current_user_id_mongo

router = APIRouter()

# Initialize the Gemini service
gemini_service = GeminiCareerService()

class JobAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

async def extract_text_from_file(file: UploadFile) -> str:
    """
    Extract text from various file formats including PDF, images, Word docs, and text files
    """
    content = await file.read()
    filename = file.filename.lower() if file.filename else ""
    
    print(f"🔍 Processing file: {filename}")
    print(f"📊 File size: {len(content)} bytes")
    print(f"📝 Content type: {file.content_type}")
    
    try:
        if filename.endswith('.txt'):
            # Plain text file
            print("✅ Processing as text file")
            return content.decode('utf-8')
        
        elif filename.endswith('.pdf'):
            # PDF file using PyMuPDF
            print("✅ Processing as PDF file")
            if not PDF_AVAILABLE or fitz is None:
                raise HTTPException(status_code=400, detail="PDF processing not available. Please install PyMuPDF.")
            pdf_document = fitz.open(stream=content, filetype="pdf")  # type: ignore
            text = ""
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                text += page.get_text()  # type: ignore
            pdf_document.close()
            print(f"✅ Extracted {len(text)} characters from PDF")
            return text
        
        elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp')):
            # Image file using OCR
            print("🖼️ Processing as image file")
            if not IMAGE_AVAILABLE or Image is None or pytesseract is None:
                raise HTTPException(status_code=400, detail="Image OCR processing not available. Please install Pillow and pytesseract.")
            
            try:
                image = Image.open(io.BytesIO(content))
                print(f"📐 Image size: {image.size}")
                text = pytesseract.image_to_string(image)
                print(f"✅ OCR extracted {len(text)} characters")
                return text
            except Exception as ocr_error:
                # Handle Tesseract not being installed
                error_msg = str(ocr_error)
                print(f"❌ OCR Error: {error_msg}")
                if "tesseract" in error_msg.lower() or "not installed" in error_msg.lower():
                    raise HTTPException(
                        status_code=400, 
                        detail="Tesseract OCR is not installed on the system. Please install Tesseract OCR or upload your resume as a PDF or text file instead."
                    )
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Failed to process image file: {error_msg}"
                    )
        
        elif filename.endswith(('.doc', '.docx')):
            # Word document
            print("✅ Processing as Word document")
            if not DOCX_AVAILABLE or Document is None:
                raise HTTPException(status_code=400, detail="Word document processing not available. Please install python-docx.")
            doc = Document(io.BytesIO(content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            print(f"✅ Extracted {len(text)} characters from Word document")
            return text
        
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format. Supported formats: .txt, .pdf, .png, .jpg, .jpeg, .bmp, .tiff, .webp, .doc, .docx"
            )
            
    except Exception as e:
        print(f"❌ File processing error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Error processing file: {str(e)}"
        )

@router.post("/analyze-job-fit")
async def analyze_job_fit(
    request: JobAnalysisRequest,
    current_user_id: str = Depends(get_current_user_id_mongo)
):
    """
    Analyze how well a resume matches a job description
    """
    try:
        analysis = gemini_service.analyze_resume_job_match(
            request.resume_text, 
            request.job_description
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/analyze-resume-file")
async def analyze_resume_file(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user_id: str = Depends(get_current_user_id_mongo)
):
    """
    Analyze resume from uploaded file against job description
    Supports: .txt, .pdf, .png, .jpg, .jpeg, .bmp, .tiff, .webp, .doc, .docx
    """
    print(f"🔍 Debug: Received request from user {current_user_id}")
    print(f"📁 Debug: File - {resume_file.filename}, Type: {resume_file.content_type}")
    print(f"📝 Debug: Job description length: {len(job_description) if job_description else 0}")
    
    try:
        # Validate inputs
        if not resume_file:
            print("❌ Debug: No file uploaded")
            raise HTTPException(status_code=400, detail="No file uploaded")
            
        if not job_description or not job_description.strip():
            print("❌ Debug: No job description provided")
            raise HTTPException(status_code=400, detail="Job description is required")
        
        print("✅ Debug: Starting file text extraction...")
        # Extract text from the uploaded file
        resume_text = await extract_text_from_file(resume_file)
        print(f"📖 Debug: Extracted text length: {len(resume_text)}")
        
        if not resume_text.strip():
            print("❌ Debug: No text could be extracted from file")
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        print("🤖 Debug: Starting Gemini analysis...")
        # Analyze using Gemini
        analysis = gemini_service.analyze_resume_job_match(resume_text, job_description)
        print("✅ Debug: Analysis completed successfully")
        
        return {
            "filename": resume_file.filename,
            "file_type": resume_file.content_type,
            "extracted_text_length": len(resume_text),
            "analysis": analysis
        }
    except HTTPException as he:
        print(f"❌ Debug: HTTP Exception - {he.detail}")
        raise
    except Exception as e:
        print(f"❌ Debug: Unexpected error - {str(e)}")
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")

@router.post("/debug-request")
async def debug_request(request: Request):
    """
    Debug endpoint to see what's being sent
    """
    print("🔍 Debug: Request received!")
    print(f"📋 Headers: {dict(request.headers)}")
    print(f"🔗 URL: {request.url}")
    print(f"📝 Method: {request.method}")
    return {"message": "Debug request received", "headers": dict(request.headers)}

@router.post("/test-analyze-resume-file")
async def test_analyze_resume_file(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Test endpoint for analyzing resume without authentication
    """
    try:
        # Extract text from the uploaded file
        resume_text = await extract_text_from_file(resume_file)
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        # Analyze using Gemini
        analysis = gemini_service.analyze_resume_job_match(resume_text, job_description)
        
        return {
            "filename": resume_file.filename,
            "file_type": resume_file.content_type,
            "extracted_text_length": len(resume_text),
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint for AI services
    """
    try:
        return {
            "status": "healthy",
            "gemini_service": "operational",
            "message": "AI Career Assistant is ready"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "gemini_service": "error",
            "error": str(e)
        }
