import requests

# Test login to get a valid token
def test_login():
    login_data = {
        "email": "test@example.com",
        "password": "test123"
    }
    
    # Try to register first (might fail if user exists, that's ok)
    try:
        register_response = requests.post(
            "http://localhost:8000/auth/signup",
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
            "http://localhost:8000/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123"
            }
        )
        print(f"Login status: {login_response.status_code}")
        if login_response.status_code == 200:
            token_data = login_response.json()
            print(f"Token received: {token_data}")
            return token_data.get('access_token')
        else:
            print(f"Login failed: {login_response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_authenticated_upload(token):
    if not token:
        print("No token available, skipping authenticated test")
        return
    
    # Test file upload with authentication
    with open('test_resume.txt', 'rb') as file:
        files = {'resume_file': ('test_resume.txt', file, 'text/plain')}
        data = {'job_description': 'Looking for a Python developer with React experience'}
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.post(
            'http://localhost:8000/api/ai/analyze-resume-file',
            files=files,
            data=data,
            headers=headers
        )
        
        print(f"Authenticated upload status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error response: {response.text}")
        else:
            print("Success!")
            print(f"Response: {response.json()}")

if __name__ == "__main__":
    token = test_login()
    test_authenticated_upload(token)
