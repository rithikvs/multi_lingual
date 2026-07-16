@echo off
REM Quick Start Script for Sign Language Application
REM Starts both Backend and Frontend servers

echo.
echo ===============================================
echo  Sign Language App - Full Stack Startup
echo ===============================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ERROR: Backend folder not found!
    echo Make sure you're running this script from the project root.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: Frontend folder not found!
    echo Make sure you're running this script from the project root.
    pause
    exit /b 1
)

echo Starting Backend Server...
echo.
start cmd /k "cd backend && npm install && npm start"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak

echo Starting Frontend Server...
echo.
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ===============================================
echo ✅ Both servers are starting!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Open Login page in your browser:
echo http://localhost:5173/login
echo ===============================================
echo.
pause
