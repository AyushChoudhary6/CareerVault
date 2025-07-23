import requests

# Test login to get a valid token for AWS backend
def test_aws_login():
    aws_backend_url = "http://careervault-alb-1168102868.ap-south-1.elb.amazonaws.com"
    
    login_data = {
        "email": "test@example.com",
        "password": "test123"
    }
    
    # Try to register first (might fail if user exists, that's ok)
    try:
        register_response = requests.post(
            f"{aws_backend_url}/auth/signup",
            json={
                "email": "test@example.com",
                "password": "test123",
                "username": "testuser"
            }
        )
        print(f"Register status: {register_response.status_code}")
        if register_response.status_code != 201:
            print(f"Register response: {register_response.text}")
    except Exception as e:
        print(f"Register failed (might already exist): {e}")
    
    # Now try to login
    try:
        login_response = requests.post(
            f"{aws_backend_url}/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123"
            }
        )
        print(f"Login status: {login_response.status_code}")
        if login_response.status_code == 200:
            token_data = login_response.json()
            print(f"Token received: {token_data}")
            return token_data.get('access_token'), aws_backend_url
        else:
            print(f"Login failed: {login_response.text}")
            return None, aws_backend_url
    except Exception as e:
        print(f"Login error: {e}")
        return None, aws_backend_url

def test_aws_authenticated_upload(token, backend_url):
    if not token:
        print("No token available, skipping authenticated test")
        return
    
    # Test file upload with authentication
    with open('test_resume.txt', 'rb') as file:
        files = {'resume_file': ('test_resume.txt', file, 'text/plain')}
        data = {'job_description': 'Looking for a Python developer with React experience and AWS cloud skills'}
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.post(
            f'{backend_url}/api/ai/analyze-resume-file',
            files=files,
            data=data,
            headers=headers
        )
        
        print(f"Authenticated upload status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error response: {response.text}")
        else:
            print("Success!")
            result = response.json()
            print(f"Response: {result}")
            
            # Print the interview questions
            if 'interview_questions' in result:
                print("\n=== INTERVIEW QUESTIONS ===")
                for i, q in enumerate(result['interview_questions'], 1):
                    print(f"{i}. {q['question']}")
                    print(f"   Answer: {q['answer']}")
                    print()

if __name__ == "__main__":
    token, backend_url = test_aws_login()
    test_aws_authenticated_upload(token, backend_url)
