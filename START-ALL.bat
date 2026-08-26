@echo off
echo ============================================
echo   Starting ResumeAI Application
echo ============================================
echo.
echo Starting Backend Server (Port 5000)...
start "ResumeAI Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server (Port 3000)...
start "ResumeAI Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo ============================================
echo   Servers are starting...
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ============================================
echo.
echo Press any key to close this window...
pause >nul
