@echo off
echo ================================================
echo Starting CareerVault Backend - DynamoDB + Cognito
echo ================================================

echo.
echo Checking Python environment...
python --version

echo.
echo Installing/updating dependencies...
cd /d "c:\personal\Old_Drive things\projects\job tracker app\backend"
pip install -r requirements.txt

echo.
echo Setting up environment variables...
if not exist .env (
    echo WARNING: .env file not found. Please copy .env.example to .env and configure it.
    echo.
    pause
)

echo.
echo Starting FastAPI server...
python main_dynamodb.py

pause
