"""
AWS Cognito Authentication Integration

This module handles AWS Cognito User Pool authentication including:
- User registration and confirmation
- User authentication and token validation
- Password management and recovery
- JWT token verification
"""

import os
import boto3
import jwt
import requests
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CognitoConfig:
    """AWS Cognito configuration and client management"""
    
    def __init__(self):
        # AWS Cognito Configuration from environment variables
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
        
        # Cognito User Pool Configuration
        self.user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
        self.client_id = os.getenv("COGNITO_CLIENT_ID")
        self.client_secret = os.getenv("COGNITO_CLIENT_SECRET")  # Optional for server-side apps
        
        # Initialize Cognito client
        self.cognito_client = None
        self.jwks_client = None
        self.jwks_keys = None
        
        # Initialize connection
        self._connect()
        self._fetch_jwks_keys()
    
    def _connect(self):
        """Initialize Cognito client"""
        try:
            # Initialize Cognito client
            session = boto3.Session(
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region
            )
            
            self.cognito_client = session.client('cognito-idp')
            
            print(f"✅ Connected to Cognito in region {self.aws_region}")
            
        except Exception as e:
            print(f"❌ Error connecting to Cognito: {e}")
            raise e
    
    def _fetch_jwks_keys(self):
        """Fetch JWKS keys for JWT token verification"""
        try:
            jwks_url = f"https://cognito-idp.{self.aws_region}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
            response = requests.get(jwks_url)
            response.raise_for_status()
            self.jwks_keys = response.json()['keys']
            
            print("✅ Fetched Cognito JWKS keys for token verification")
            
        except Exception as e:
            print(f"❌ Error fetching JWKS keys: {e}")
            raise e
    
    def signup_user(self, username: str, password: str, email: str, **kwargs) -> Dict[str, Any]:
        """
        Register a new user in Cognito User Pool
        
        Args:
            username: Unique username
            password: User password (must meet policy requirements)
            email: User email address
            **kwargs: Additional user attributes
            
        Returns:
            Dict containing user registration information
            
        Raises:
            ClientError: If registration fails
        """
        try:
            user_attributes = [
                {'Name': 'email', 'Value': email},
                {'Name': 'email_verified', 'Value': 'true'}  # Auto-verify for simplicity
            ]
            
            # Add any additional attributes
            for key, value in kwargs.items():
                if key.startswith('custom:') or key in ['given_name', 'family_name', 'phone_number']:
                    user_attributes.append({'Name': key, 'Value': str(value)})
            
            response = self.cognito_client.admin_create_user(
                UserPoolId=self.user_pool_id,
                Username=username,
                UserAttributes=user_attributes,
                TemporaryPassword=password,
                MessageAction='SUPPRESS',  # Don't send welcome email
                ForceAliasCreation=False
            )
            
            # Set permanent password
            self.cognito_client.admin_set_user_password(
                UserPoolId=self.user_pool_id,
                Username=username,
                Password=password,
                Permanent=True
            )
            
            return {
                'user_sub': response['User']['Attributes'][0]['Value'],  # The 'sub' attribute
                'username': username,
                'email': email,
                'status': 'CONFIRMED'
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'UsernameExistsException':
                raise ValueError("Username already exists")
            elif error_code == 'InvalidPasswordException':
                raise ValueError("Password does not meet requirements")
            elif error_code == 'UserLambdaValidationException':
                raise ValueError("User validation failed")
            else:
                raise ValueError(f"Registration failed: {error_message}")
    
    def authenticate_user(self, username: str, password: str) -> Dict[str, Any]:
        """
        Authenticate user and return tokens
        
        Args:
            username: Username or email
            password: User password
            
        Returns:
            Dict containing access tokens and user information
            
        Raises:
            ValueError: If authentication fails
        """
        try:
            # Use ADMIN_NO_SRP_AUTH flow for server-side authentication
            auth_params = {
                'USERNAME': username,
                'PASSWORD': password
            }
            
            # Add client secret if configured
            if self.client_secret:
                import hmac
                import hashlib
                import base64
                
                message = bytes(username + self.client_id, 'utf-8')
                key = bytes(self.client_secret, 'utf-8')
                secret_hash = base64.b64encode(hmac.new(key, message, digestmod=hashlib.sha256).digest()).decode()
                auth_params['SECRET_HASH'] = secret_hash
            
            response = self.cognito_client.admin_initiate_auth(
                UserPoolId=self.user_pool_id,
                ClientId=self.client_id,
                AuthFlow='ADMIN_NO_SRP_AUTH',
                AuthParameters=auth_params
            )
            
            # Extract tokens
            auth_result = response['AuthenticationResult']
            
            return {
                'access_token': auth_result['AccessToken'],
                'id_token': auth_result['IdToken'],
                'refresh_token': auth_result['RefreshToken'],
                'expires_in': auth_result['ExpiresIn'],
                'token_type': auth_result['TokenType']
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'NotAuthorizedException':
                raise ValueError("Invalid username or password")
            elif error_code == 'UserNotFoundException':
                raise ValueError("User not found")
            elif error_code == 'UserNotConfirmedException':
                raise ValueError("User email not confirmed")
            else:
                raise ValueError(f"Authentication failed: {error_message}")
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT access token or ID token
            
        Returns:
            Dict containing decoded token payload
            
        Raises:
            ValueError: If token is invalid
        """
        try:
            # Get token header
            header = jwt.get_unverified_header(token)
            kid = header['kid']
            
            # Find the corresponding key
            key = None
            for jwk in self.jwks_keys:
                if jwk['kid'] == kid:
                    key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                    break
            
            if not key:
                raise ValueError("Invalid token: Key not found")
            
            # Verify and decode token
            payload = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                audience=self.client_id,
                issuer=f"https://cognito-idp.{self.aws_region}.amazonaws.com/{self.user_pool_id}"
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError as e:
            raise ValueError(f"Invalid token: {str(e)}")
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        Get user information from Cognito using access token
        
        Args:
            access_token: Valid Cognito access token
            
        Returns:
            Dict containing user information
        """
        try:
            response = self.cognito_client.get_user(AccessToken=access_token)
            
            # Convert attributes to dict
            user_attributes = {}
            for attr in response['UserAttributes']:
                user_attributes[attr['Name']] = attr['Value']
            
            return {
                'username': response['Username'],
                'user_id': user_attributes.get('sub'),
                'email': user_attributes.get('email'),
                'email_verified': user_attributes.get('email_verified') == 'true',
                'attributes': user_attributes
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise ValueError(f"Failed to get user info: {error_message}")
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            Dict containing new tokens
        """
        try:
            auth_params = {
                'REFRESH_TOKEN': refresh_token
            }
            
            response = self.cognito_client.admin_initiate_auth(
                UserPoolId=self.user_pool_id,
                ClientId=self.client_id,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters=auth_params
            )
            
            auth_result = response['AuthenticationResult']
            
            return {
                'access_token': auth_result['AccessToken'],
                'id_token': auth_result['IdToken'],
                'expires_in': auth_result['ExpiresIn'],
                'token_type': auth_result['TokenType']
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise ValueError(f"Token refresh failed: {error_message}")

# Global Cognito instance
cognito_config = CognitoConfig()

# Convenience functions
def get_cognito_client():
    """Get Cognito client"""
    return cognito_config.cognito_client

def signup_user(username: str, password: str, email: str, **kwargs):
    """Register a new user"""
    return cognito_config.signup_user(username, password, email, **kwargs)

def authenticate_user(username: str, password: str):
    """Authenticate user and return tokens"""
    return cognito_config.authenticate_user(username, password)

def verify_token(token: str):
    """Verify JWT token"""
    return cognito_config.verify_token(token)

def get_user_info(access_token: str):
    """Get user information from access token"""
    return cognito_config.get_user_info(access_token)

def refresh_token(refresh_token: str):
    """Refresh access token"""
    return cognito_config.refresh_token(refresh_token)
