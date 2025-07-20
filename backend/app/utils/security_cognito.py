"""
Security utilities for Cognito authentication

This module provides security utilities for AWS Cognito authentication,
replacing the JWT-based custom authentication system.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.cognito_service import verify_token, get_user_info
from app.utils.models_dynamodb import UserResponse, CognitoTokenResponse

# Security scheme for FastAPI
security = HTTPBearer()


async def get_current_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract and validate the bearer token from the request
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        str: Valid access token
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verify the token with Cognito
        payload = verify_token(token)
        return token
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id(token: str = Depends(get_current_user_token)) -> str:
    """
    Get the current user's Cognito user ID from the token
    
    Args:
        token: Valid access token
        
    Returns:
        str: Cognito user ID (sub)
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Get user info from Cognito
        user_info = get_user_info(token)
        user_id = user_info.get('user_id')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_id
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get user information",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_info(token: str = Depends(get_current_user_token)) -> UserResponse:
    """
    Get the current user's full information from Cognito
    
    Args:
        token: Valid access token
        
    Returns:
        UserResponse: User information
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Get user info from Cognito
        user_info = get_user_info(token)
        
        return UserResponse(
            user_id=user_info['user_id'],
            username=user_info['username'],
            email=user_info['email'],
            email_verified=user_info.get('email_verified', True),
            given_name=user_info.get('attributes', {}).get('given_name'),
            family_name=user_info.get('attributes', {}).get('family_name')
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get user information",
            headers={"WWW-Authenticate": "Bearer"},
        )


def create_token_response(cognito_response: Dict[str, Any]) -> CognitoTokenResponse:
    """
    Create a standardized token response from Cognito response
    
    Args:
        cognito_response: Response from Cognito authentication
        
    Returns:
        CognitoTokenResponse: Standardized token response
    """
    return CognitoTokenResponse(
        access_token=cognito_response['access_token'],
        id_token=cognito_response['id_token'],
        refresh_token=cognito_response['refresh_token'],
        expires_in=cognito_response['expires_in'],
        token_type=cognito_response.get('token_type', 'Bearer')
    )


def validate_password_strength(password: str) -> bool:
    """
    Validate password strength (for client-side validation)
    Note: Cognito will enforce its own password policy
    
    Args:
        password: Password to validate
        
    Returns:
        bool: True if password meets basic requirements
    """
    if len(password) < 8:
        return False
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    return has_upper and has_lower and has_digit and has_special


def get_password_requirements() -> Dict[str, Any]:
    """
    Get password requirements for client-side display
    
    Returns:
        Dict: Password requirements
    """
    return {
        "min_length": 8,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_numbers": True,
        "require_symbols": True,
        "description": "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols"
    }


# Exception classes for better error handling
class AuthenticationError(Exception):
    """Raised when authentication fails"""
    pass


class AuthorizationError(Exception):
    """Raised when user is not authorized for an action"""
    pass


class TokenExpiredError(Exception):
    """Raised when token has expired"""
    pass


# Optional: Rate limiting decorator (for future implementation)
def rate_limit(max_requests: int = 100, window_minutes: int = 60):
    """
    Rate limiting decorator for authentication endpoints
    
    Args:
        max_requests: Maximum requests per window
        window_minutes: Time window in minutes
    """
    def decorator(func):
        # This would be implemented with Redis or DynamoDB
        # For now, just return the function unchanged
        return func
    return decorator
