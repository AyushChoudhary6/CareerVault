"""
Authentication Routes - MongoDB Version

This module handles user authentication including:
- User registration (signup)
- User login with JWT token generation
- Password validation and security
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.utils.models_mongo import UserSignup, UserLogin, Token, MessageResponse, UserResponse
from app.utils.mongodb_service import UserService
from app.utils.security import verify_password, create_token_response, get_current_user_id_mongo

router = APIRouter()


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Register a new user
    
    Args:
        user_data: User registration data (username, email, password)
        
    Returns:
        MessageResponse: Success message with user ID
        
    Raises:
        HTTPException: If user already exists or validation fails
    """
    # Check if user already exists by email
    existing_user_email = await UserService.get_user_by_email(user_data.email)
    if existing_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_user_username = await UserService.get_user_by_username(user_data.username)
    if existing_user_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    try:
        # Create new user
        new_user = await UserService.create_user(user_data)
        
        return MessageResponse(
            message="User created successfully",
            success=True
        )
    
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """
    Authenticate user and return JWT token
    
    Args:
        user_credentials: User login credentials (email, password)
        
    Returns:
        Token: JWT access token with user information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user by email
    user = await UserService.get_user_by_email(user_credentials.email)
    
    # Check if user exists and password is correct
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create and return token response
    token_data = create_token_response(
        user_id=str(user.id),
        username=user.username,
        email=user.email
    )
    
    return Token(**token_data)


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user_id: str = Depends(get_current_user_id_mongo)):
    """
    Get current user information from JWT token
    
    Args:
        current_user_id: User ID from JWT token
        
    Returns:
        UserResponse: Current user information
        
    Raises:
        HTTPException: If user not found
    """
    user = await UserService.get_user_by_id(current_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        is_active=user.is_active
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(current_user_id: str = Depends(get_current_user_id_mongo)):
    """
    Refresh JWT token for authenticated user
    
    Args:
        current_user_id: User ID from current JWT token
        
    Returns:
        Token: New JWT access token
        
    Raises:
        HTTPException: If user not found
    """
    user = await UserService.get_user_by_id(current_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create new token
    token_data = create_token_response(
        user_id=str(user.id),
        username=user.username,
        email=user.email
    )
    
    return Token(**token_data)
