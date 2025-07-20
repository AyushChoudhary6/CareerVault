"""
DynamoDB Configuration and Connection Management

This module handles DynamoDB connection and configuration using boto3.
"""

import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DynamoDBConfig:
    """DynamoDB configuration and connection management"""
    
    def __init__(self):
        # AWS Configuration from environment variables
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
        
        # Table names
        self.jobs_table_name = os.getenv("DYNAMODB_JOBS_TABLE", "CareerVault-Jobs")
        self.users_table_name = os.getenv("DYNAMODB_USERS_TABLE", "CareerVault-Users")
        
        # Initialize DynamoDB resources
        self.dynamodb_resource = None
        self.dynamodb_client = None
        self.jobs_table = None
        self.users_table = None
        
        # Initialize connection
        self._connect()
    
    def _connect(self):
        """Initialize DynamoDB connection"""
        try:
            # Initialize DynamoDB client and resource
            session = boto3.Session(
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region
            )
            
            self.dynamodb_client = session.client('dynamodb')
            self.dynamodb_resource = session.resource('dynamodb')
            
            # Get table references
            self.jobs_table = self.dynamodb_resource.Table(self.jobs_table_name)
            self.users_table = self.dynamodb_resource.Table(self.users_table_name)
            
            print(f"✅ Connected to DynamoDB in region {self.aws_region}")
            
        except Exception as e:
            print(f"❌ Error connecting to DynamoDB: {e}")
            raise e
    
    def create_tables_if_not_exist(self):
        """Create DynamoDB tables if they don't exist (for development)"""
        try:
            # Create Jobs table
            self._create_jobs_table()
            # Create Users table (for Cognito user metadata)
            self._create_users_table()
            
        except ClientError as e:
            if e.response['Error']['Code'] != 'ResourceInUseException':
                print(f"❌ Error creating tables: {e}")
                raise e
    
    def _create_jobs_table(self):
        """Create the jobs table with proper schema"""
        try:
            table = self.dynamodb_client.create_table(
                TableName=self.jobs_table_name,
                KeySchema=[
                    {
                        'AttributeName': 'user_id',
                        'KeyType': 'HASH'  # Partition key
                    },
                    {
                        'AttributeName': 'job_id',
                        'KeyType': 'RANGE'  # Sort key
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'user_id',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'job_id',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'status',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'created_at',
                        'AttributeType': 'S'
                    }
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'status-created_at-index',
                        'KeySchema': [
                            {
                                'AttributeName': 'status',
                                'KeyType': 'HASH'
                            },
                            {
                                'AttributeName': 'created_at',
                                'KeyType': 'RANGE'
                            }
                        ],
                        'Projection': {
                            'ProjectionType': 'ALL'
                        }
                    }
                ],
                BillingMode='PAY_PER_REQUEST',
                Tags=[
                    {
                        'Key': 'Application',
                        'Value': 'CareerVault'
                    },
                    {
                        'Key': 'Environment',
                        'Value': os.getenv('ENVIRONMENT', 'development')
                    }
                ]
            )
            
            # Wait for table to be created
            table_resource = self.dynamodb_resource.Table(self.jobs_table_name)
            table_resource.wait_until_exists()
            
            print(f"✅ Created jobs table: {self.jobs_table_name}")
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                print(f"ℹ️ Jobs table {self.jobs_table_name} already exists")
            else:
                raise e
    
    def _create_users_table(self):
        """Create the users metadata table (for additional user data beyond Cognito)"""
        try:
            table = self.dynamodb_client.create_table(
                TableName=self.users_table_name,
                KeySchema=[
                    {
                        'AttributeName': 'user_id',
                        'KeyType': 'HASH'  # Partition key (Cognito sub)
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'user_id',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'email',
                        'AttributeType': 'S'
                    }
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'email-index',
                        'KeySchema': [
                            {
                                'AttributeName': 'email',
                                'KeyType': 'HASH'
                            }
                        ],
                        'Projection': {
                            'ProjectionType': 'ALL'
                        }
                    }
                ],
                BillingMode='PAY_PER_REQUEST',
                Tags=[
                    {
                        'Key': 'Application',
                        'Value': 'CareerVault'
                    },
                    {
                        'Key': 'Environment',
                        'Value': os.getenv('ENVIRONMENT', 'development')
                    }
                ]
            )
            
            # Wait for table to be created
            table_resource = self.dynamodb_resource.Table(self.users_table_name)
            table_resource.wait_until_exists()
            
            print(f"✅ Created users metadata table: {self.users_table_name}")
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                print(f"ℹ️ Users table {self.users_table_name} already exists")
            else:
                raise e

# Global DynamoDB instance
dynamodb_config = DynamoDBConfig()

# Convenience functions for getting table references
def get_jobs_table():
    """Get jobs table reference"""
    return dynamodb_config.jobs_table

def get_users_table():
    """Get users table reference"""
    return dynamodb_config.users_table

def get_dynamodb_client():
    """Get DynamoDB client"""
    return dynamodb_config.dynamodb_client

def get_dynamodb_resource():
    """Get DynamoDB resource"""
    return dynamodb_config.dynamodb_resource
