"""
Test Job Creation with Date Issue

This script tests job creation to isolate the date serialization issue.
"""

import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000"

def test_job_creation():
    """Test job creation with authentication"""
    print("🏢 Testing Job Creation...")
    print("=" * 40)
    
    # First login with an existing test user
    login_data = {
        "email": "test_77ykse@example.com",
        "password": "testpassword123"
    }
    
    # Step 1: Login
    print("1️⃣ Logging in...")
    try:
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get("access_token")
            print(f"   ✅ Login successful")
        else:
            print(f"   ❌ Login failed: {login_response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return False
    
    # Step 2: Create Job
    print("2️⃣ Creating job...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test with simple job data
    job_data = {
        "company": "Test Company",
        "position": "Software Engineer",
        "status": "Applied",
        "applied_date": "2025-07-18",  # Send as string
        "application_link": "https://example.com/job",
        "notes": "Test job creation"
    }
    
    try:
        job_response = requests.post(
            f"{BASE_URL}/api/jobs/",
            json=job_data,
            headers=headers
        )
        
        if job_response.status_code == 201:
            job_result = job_response.json()
            print(f"   ✅ Job created successfully!")
            print(f"   Job ID: {job_result.get('id')}")
            print(f"   Company: {job_result.get('company')}")
            print(f"   Position: {job_result.get('position')}")
            return True
        else:
            print(f"   ❌ Job creation failed: {job_response.status_code}")
            print(f"   Response: {job_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Job creation error: {e}")
        return False

if __name__ == "__main__":
    print("Testing job creation...")
    success = test_job_creation()
    
    if success:
        print("\n🎉 Job creation test passed!")
    else:
        print("\n❌ Job creation test failed!")
    
    input("\nPress Enter to exit...")
