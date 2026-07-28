@echo off
echo Starting backend...
cd /d "%~dp0"

REM Read BACKEND_PORT from root .env (one level up)
for /f "tokens=1,2 delims==" %%A in ('type "..\\.env" ^| findstr /i "BACKEND_PORT"') do set %%A=%%B

REM Default to 8000 if not set
if not defined BACKEND_PORT set BACKEND_PORT=8000

echo Using port %BACKEND_PORT%
.\venv\Scripts\python.exe manage.py runserver %BACKEND_PORT%
