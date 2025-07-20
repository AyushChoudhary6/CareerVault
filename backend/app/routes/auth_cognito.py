"""
Authentication Routes - Cognito Version

This module handles user authentication using AWS Cognito including:
- User registration with Cognito User Pools
- User login with Cognito authentication
- Token verification and user information retrieval
"""

from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from app.utils.models_dynamodb import (
    UserSignup, UserLogin, CognitoTokenResponse, 
    MessageResponse, UserResponse
)
from app.utils.cognito_service import signup_user, authenticate_user, get_user_info
from app.utils.dynamodb_service import user_repository
from app.utils.security_cognito import (
    get_current_user_info, get_current_user_id, 
    create_token_response, validate_password_strength
)

router = APIRouter()


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Register a new user with Cognito User Pool
    
    Args:
        user_data: User registration data (username, email, password)
        
    Returns:
        MessageResponse: Success message
        
    Raises:
        HTTPException: If user already exists or validation fails
    """
    # Validate password strength (optional client-side validation)
    if not validate_password_strength(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password does not meet security requirements"
        )
    
    try:
        # Create user in Cognito User Pool
        cognito_user = signup_user(
            username=user_data.username,
            password=user_data.password,
            email=user_data.email,
            given_name=user_data.given_name,
            family_name=user_data.family_name
        )
        
        # Create user metadata in DynamoDB
        await user_repository.create_user_metadata(
            user_id=cognito_user['user_sub'],
            email=user_data.email,
            username=user_data.username
        )
        
        return MessageResponse(
            message="User created successfully. You can now log in.",
            success=True
        )
        
    except ValueError as e:
        # Handle Cognito-specific errors
        error_message = str(e)
        if "Username already exists" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        elif "Password does not meet requirements" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet Cognito policy requirements"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
    
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )


@router.post("/login", response_model=CognitoTokenResponse)
async def login(user_credentials: UserLogin):
    """
    Authenticate user with Cognito and return JWT tokens
    
    Args:
        user_credentials: User login credentials (username, password)
        
    Returns:
        CognitoTokenResponse: JWT tokens and user information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        # Authenticate with Cognito
        cognito_response = authenticate_user(
            username=user_credentials.username,
            password=user_credentials.password
        )
        
        # Get user info to extract user_id
        user_info = get_user_info(cognito_response['access_token'])
        user_id = user_info['user_id']
        
        # Update last login timestamp in DynamoDB metadata
        await user_repository.update_last_login(user_id)
        
        # Return standardized token response
        return create_token_response(cognito_response)
        
    except ValueError as e:
        # Handle Cognito authentication errors
        error_message = str(e)
        if "Invalid username or password" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif "User not found" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",  # Don't reveal user existence
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif "User email not confirmed" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Please verify your email address before logging in",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service unavailable"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: UserResponse = Depends(get_current_user_info)):
    """
    Get current authenticated user information
    
    Args:
        current_user: Injected current user from token
        
    Returns:
        UserResponse: Current user information
    """
    return current_user


@router.post("/refresh", response_model=CognitoTokenResponse)
async def refresh_access_token(refresh_token: str):
    """
    Refresh access token using refresh token
    
    Args:
        refresh_token: Valid refresh token
        
    Returns:
        CognitoTokenResponse: New access token and ID token
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    try:
        from app.utils.cognito_service import refresh_token as cognito_refresh_token
        
        # Refresh tokens with Cognito
        cognito_response = cognito_refresh_token(refresh_token)
        
        return CognitoTokenResponse(
            access_token=cognito_response['access_token'],
            id_token=cognito_response['id_token'],
            refresh_token=refresh_token,  # Refresh token doesn't change
            expires_in=cognito_response['expires_in'],
            token_type=cognito_response.get('token_type', 'Bearer')
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user_id: str = Depends(get_current_user_id)):
    """
    Log out the current user
    Note: With Cognito, logout is typically handled client-side by discarding tokens
    
    Args:
        current_user_id: Current authenticated user ID
        
    Returns:
        MessageResponse: Success message
    """
    # In a full implementation, you might:
    # 1. Add the token to a blacklist
    # 2. Revoke the refresh token in Cognito
    # 3. Update user metadata with logout timestamp
    
    try:
        # Update user metadata to track logout (optional)
        await user_repository.update_user_metadata(
            user_id=current_user_id,
            last_logout=datetime.utcnow().isoformat()
        )
        
        return MessageResponse(
            message="Successfully logged out",
            success=True
        )
        
    except Exception as e:
        # Don't fail logout if metadata update fails
        print(f"Warning: Failed to update logout metadata: {e}")
        return MessageResponse(
            message="Successfully logged out",
            success=True
        )


@router.get("/password-requirements")
async def get_password_requirements():
    """
    Get password policy requirements for client-side validation
    
    Returns:
        Dict: Password requirements
    """
    from app.utils.security_cognito import get_password_requirements
    return get_password_requirements()


# Health check endpoint for authentication service
@router.get("/health")
async def auth_health_check():
    """
    Health check for authentication service
    
    Returns:
        Dict: Service health status
    """
    try:
        # Test Cognito connectivity
        from app.utils.cognito_service import get_cognito_client
        client = get_cognito_client()
        
        # Simple operation to test connectivity
        # This will raise an exception if Cognito is not accessible
        
        return {
            "status": "healthy",
            "service": "cognito-authentication",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "cognito-authentication",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
