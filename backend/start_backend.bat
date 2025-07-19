@echo off
echo ========================================
echo    CareerVault Backend Startup
echo ========================================
echo.

echo [1/3] Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully!
echo.

echo [2/3] Starting MongoDB backend server...
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.

echo [3/3] Starting FastAPI server with MongoDB...
python main_mongo.py

if %errorlevel% neq 0 (
    echo Failed to start server!
    pause
    exit /b 1
)

pause
