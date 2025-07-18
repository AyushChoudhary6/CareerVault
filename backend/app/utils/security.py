"""
Security Utilities for JWT Authentication and Password Hashing

This module provides utilities for:
- Password hashing and verification using bcrypt
- JWT token generation and validation
- User authentication middleware
"""

from datetime import datetime, timedelta
from typing import Optional, Union
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# Load environment variables
# load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    
    Args:
        password (str): Plain text password
        
    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    
    Args:
        plain_password (str): Plain text password
        hashed_password (str): Hashed password from database
        
    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data (dict): Data to encode in the token (usually user info)
        expires_delta (timedelta, optional): Token expiration time
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token
    
    Args:
        token (str): JWT token to verify
        
    Returns:
        dict: Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    print(f"🔐 Verifying token: {token[:50]}...")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"🔐 Token verified successfully: {payload}")
        return payload
    except JWTError as e:
        print(f"❌ Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """
    Extract current user ID from JWT token (SQLAlchemy version)
    
    This function is used as a dependency in FastAPI routes that require authentication.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        int: Current user's ID
        
    Raises:
        HTTPException: If token is invalid or user_id is missing
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return int(user_id)


def get_current_user_id_mongo(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract current user ID from JWT token (MongoDB version)
    
    This function is used as a dependency in FastAPI routes that require authentication with MongoDB.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        str: Current user's ID (ObjectId as string)
        
    Raises:
        HTTPException: If token is invalid or user_id is missing
    """
    print(f"🔐 Auth check - Token received: {credentials.credentials[:50]}...")
    
    token = credentials.credentials
    payload = verify_token(token)
    print(f"🔐 Auth check - Token payload: {payload}")
    
    user_id = payload.get("user_id")
    if user_id is None:
        print("❌ Auth check - No user_id in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"✅ Auth check - User ID: {user_id}")
    return str(user_id)


def create_token_response(user_id: Union[int, str], username: str, email: str) -> dict:
    """
    Create a complete token response with user data
    
    Args:
        user_id (Union[int, str]): User's database ID (int for SQLAlchemy, str for MongoDB)
        username (str): User's username
        email (str): User's email
        
    Returns:
        dict: Token response with access token and user info
    """
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": str(user_id), "username": username, "email": email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        "user_id": str(user_id),
        "username": username,
        "email": email
    }


# Optional: Function to check if user has specific permissions
def require_permissions(required_permissions: Optional[list] = None):
    """
    Dependency factory for checking user permissions
    
    Args:
        required_permissions (list): List of required permissions
        
    Returns:
        function: Dependency function for FastAPI
    """
    def check_permissions(current_user_id: int = Depends(get_current_user_id)):
        # For now, just return the user_id
        # In the future, you can add permission checking logic here
        return current_user_id
    
    return check_permissions
