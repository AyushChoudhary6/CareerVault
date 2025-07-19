import requests

# Test the file upload endpoint
url = "http://localhost:8000/api/ai/test-analyze-resume-file"

# Prepare the file and form data
files = {
    'resume_file': ('test_resume.txt', open('test_resume.txt', 'rb'), 'text/plain')
}
data = {
    'job_description': 'Software Developer position requiring Python and JavaScript skills. Looking for someone with React experience.'
}

try:
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(f"Response headers: {response.headers}")
        
except Exception as e:
    print(f"Exception: {e}")
finally:
    # Close the file
    files['resume_file'][1].close()
