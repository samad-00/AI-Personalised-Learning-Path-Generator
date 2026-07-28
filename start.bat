@echo off
echo ================================
echo  AI Learning Path Generator
echo ================================

REM Read BACKEND_PORT from .env
for /f "tokens=1,2 delims==" %%A in ('type ".env" ^| findstr /i "BACKEND_PORT"') do set %%A=%%B
if not defined BACKEND_PORT set BACKEND_PORT=8000

echo Backend port: %BACKEND_PORT%
echo.

REM Start backend in a new window
start "Backend (Django)" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver %BACKEND_PORT%"

REM Give backend 2 seconds to start
timeout /t 2 /nobreak >nul

REM Start frontend in a new window, passing the port
start "Frontend (Vite)" cmd /k "cd frontend && set BACKEND_PORT=%BACKEND_PORT% && npm run dev"

echo Both servers started!
echo   Backend: http://localhost:%BACKEND_PORT%
echo   Frontend: http://localhost:5173
pause

