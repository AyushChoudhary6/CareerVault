@echo off
echo ========================================
echo    Job Tracker Full Stack Startup
echo ========================================
echo.

echo This script will start both backend and frontend servers.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause

echo [1/4] Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies!
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed!
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\vite-project
npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies!
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed!
echo.

echo [3/4] Starting Backend Server...
cd ..\backend
start "Job Tracker Backend" cmd /k "echo Starting backend on http://localhost:8000 && python main_mongo.py"
echo ✅ Backend server starting in new window...
echo.

echo [4/4] Waiting 5 seconds then starting Frontend...
timeout /t 5 /nobreak > nul
cd ..\vite-project
start "Job Tracker Frontend" cmd /k "echo Starting frontend on http://localhost:3000 && npm run dev"
echo ✅ Frontend server starting in new window...
echo.

echo ========================================
echo    🚀 Job Tracker Started Successfully!
echo ========================================
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo Close this window or press any key to continue...
pause > nul
