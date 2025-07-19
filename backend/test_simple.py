"""
Simple Backend Test - Uses requests library

This script tests the basic connectivity of the CareerVault backend.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_backend_connection():
    """Test basic backend connectivity"""
    print("🔍 Testing CareerVault Backend Connection...")
    print("=" * 50)
    
    # Test 1: Health Check
    print("1. Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Root endpoint OK: {data.get('message', 'No message')}")
        else:
            print(f"   ❌ Root endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Cannot connect to {BASE_URL}")
        print("   📌 Make sure the backend server is running!")
        return False
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    # Test 2: API Documentation
    print("2. Testing API documentation...")
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("   ✅ API docs accessible at /docs")
        else:
            print(f"   ❌ API docs failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ API docs error: {e}")
    
    # Test 3: CORS Headers
    print("3. Testing CORS headers...")
    try:
        response = requests.options(f"{BASE_URL}/", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET"
        }, timeout=5)
        cors_origin = response.headers.get("Access-Control-Allow-Origin")
        if cors_origin:
            print(f"   ✅ CORS enabled: {cors_origin}")
        else:
            print("   ⚠️  CORS headers not found")
    except Exception as e:
        print(f"   ❌ CORS test error: {e}")
    
    # Test 4: Auth endpoint (should fail without token)
    print("4. Testing auth endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/auth/me", timeout=5)
        if response.status_code == 401:
            print("   ✅ Auth endpoint working (401 unauthorized as expected)")
        else:
            print(f"   ⚠️  Unexpected auth response: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Auth endpoint error: {e}")
    
    # Test 5: Jobs endpoint (should fail without token)
    print("5. Testing jobs endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/jobs", timeout=5)
        if response.status_code == 401:
            print("   ✅ Jobs endpoint working (401 unauthorized as expected)")
        else:
            print(f"   ⚠️  Unexpected jobs response: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Jobs endpoint error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Backend connection test completed!")
    print(f"📖 API Documentation: {BASE_URL}/docs")
    print(f"🌐 Frontend should connect to: {BASE_URL}")
    return True

if __name__ == "__main__":
    print("Starting backend connection test...")
    print("Make sure the backend server is running first!")
    print()
    
    try:
        test_backend_connection()
    except KeyboardInterrupt:
        print("\n⏹️  Test cancelled by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
    
    input("\nPress Enter to exit...")
