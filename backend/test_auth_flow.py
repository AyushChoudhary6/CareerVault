"""
Full Authentication Test Script

This script tests the complete authentication flow:
1. User signup
2. User login  
3. Protected route access
4. User data retrieval
"""

import requests
import json
import random
import string

BASE_URL = "http://localhost:8000"

def generate_test_user():
    """Generate a random test user"""
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return {
        "username": f"testuser_{random_suffix}",
        "email": f"test_{random_suffix}@example.com",
        "password": "testpassword123"
    }

def test_auth_flow():
    """Test complete authentication flow"""
    print("🔐 Testing Full Authentication Flow")
    print("=" * 50)
    
    # Generate test user
    test_user = generate_test_user()
    print(f"📝 Test User: {test_user['username']} ({test_user['email']})")
    
    # Step 1: Test Signup
    print("\n1️⃣ Testing User Signup...")
    try:
        signup_response = requests.post(
            f"{BASE_URL}/auth/signup",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        if signup_response.status_code == 201:
            signup_data = signup_response.json()
            print(f"   ✅ Signup successful: {signup_data.get('message', 'User created')}")
        else:
            print(f"   ❌ Signup failed: {signup_response.status_code}")
            print(f"   Response: {signup_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Signup error: {e}")
        return False
    
    # Step 2: Test Login
    print("\n2️⃣ Testing User Login...")
    try:
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": test_user["email"],
                "password": test_user["password"]
            },
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            access_token = login_data.get("access_token")
            if access_token:
                print(f"   ✅ Login successful: Token received")
                print(f"   Token type: {login_data.get('token_type', 'bearer')}")
            else:
                print(f"   ❌ Login failed: No token received")
                return False
        else:
            print(f"   ❌ Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return False
    
    # Step 3: Test Protected Route - Get Current User
    print("\n3️⃣ Testing Protected Route (/auth/me)...")
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        
        if me_response.status_code == 200:
            user_data = me_response.json()
            print(f"   ✅ User data retrieved successfully:")
            print(f"       ID: {user_data.get('id')}")
            print(f"       Username: {user_data.get('username')}")
            print(f"       Email: {user_data.get('email')}")
            print(f"       Active: {user_data.get('is_active')}")
        else:
            print(f"   ❌ Protected route failed: {me_response.status_code}")
            print(f"   Response: {me_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Protected route error: {e}")
        return False
    
    # Step 4: Test Jobs Endpoint (should work with valid token)
    print("\n4️⃣ Testing Jobs API...")
    try:
        jobs_response = requests.get(f"{BASE_URL}/api/jobs", headers=headers)
        
        if jobs_response.status_code == 200:
            jobs_data = jobs_response.json()
            print(f"   ✅ Jobs API accessible: {len(jobs_data)} jobs found")
        else:
            print(f"   ❌ Jobs API failed: {jobs_response.status_code}")
            print(f"   Response: {jobs_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Jobs API error: {e}")
        return False
    
    # Step 5: Test Invalid Token
    print("\n5️⃣ Testing Invalid Token...")
    try:
        invalid_headers = {
            "Authorization": "Bearer invalid_token_here",
            "Content-Type": "application/json"
        }
        
        invalid_response = requests.get(f"{BASE_URL}/auth/me", headers=invalid_headers)
        
        if invalid_response.status_code == 401:
            print("   ✅ Invalid token properly rejected (401)")
        else:
            print(f"   ⚠️  Unexpected response for invalid token: {invalid_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Invalid token test error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Authentication Flow Test Completed Successfully!")
    print(f"✅ User Created: {test_user['username']}")
    print(f"✅ Login Token: {access_token[:20]}...")
    print(f"✅ Protected Routes: Working")
    print(f"🌐 Frontend can now use this user to test the app!")
    
    return True

if __name__ == "__main__":
    print("Starting authentication flow test...")
    print("Make sure the backend server is running!")
    print()
    
    try:
        success = test_auth_flow()
        if success:
            print("\n🎯 All tests passed! Authentication is working correctly.")
        else:
            print("\n❌ Some tests failed. Check the backend server and try again.")
    except KeyboardInterrupt:
        print("\n⏹️ Test cancelled by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
    
    input("\nPress Enter to exit...")
