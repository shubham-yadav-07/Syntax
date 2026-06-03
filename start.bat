@echo off
echo.
echo  SYNTAX - AI Code Analysis Platform
echo.

echo [1/3] Installing backend...
cd backend
call npm install
cd ..

echo [2/3] Installing frontend...
cd frontend
call npm install
cd ..

echo [3/3] Setting up AI engine...
cd ai-engine
python -m venv venv 2>nul
call venv\Scripts\activate.bat
pip install -r requirements.txt -q
cd ..

echo.
echo Starting all services...
echo   AI Engine  - http://localhost:8000
echo   Backend    - http://localhost:5000
echo   Frontend   - http://localhost:5173
echo.

start "AI Engine" cmd /k "cd ai-engine && venv\Scripts\activate && python main.py"
timeout /t 3 /nobreak >nul
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services started!
echo Open http://localhost:5173 in your browser
echo.
pause
