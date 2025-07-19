import requests

def test_debug_upload():
    # Test debug upload endpoint
    with open('test_resume.txt', 'rb') as file:
        files = {'resume_file': ('test_resume.txt', file, 'text/plain')}
        data = {'job_description': 'Looking for a Python developer with React experience'}
        
        response = requests.post(
            'http://localhost:8000/api/ai/debug-upload',
            files=files,
            data=data
        )
        
        print(f"Debug upload status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error response: {response.text}")
        else:
            print("Debug upload successful!")
            print(f"Response: {response.json()}")

if __name__ == "__main__":
    test_debug_upload()
