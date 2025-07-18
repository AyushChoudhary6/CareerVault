@echo off
echo ========================================
echo    Job Tracker Frontend Startup
echo ========================================
echo.

echo [1/2] Installing Node.js dependencies...
cd "vite-project"
npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully!
echo.

echo [2/2] Starting Vite development server...
echo Frontend will be available at: http://localhost:3000
echo.

npm run dev

if %errorlevel% neq 0 (
    echo Failed to start frontend server!
    pause
    exit /b 1
)

pause
