@echo off
echo Starting Catatu Backend...
start "Backend" cmd /c "cd backend && npm run dev"

echo Starting Catatu Frontend...
start "Frontend" cmd /c "cd frontend && npm run dev"

echo Servers are running! 
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
