# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "Servers are running!" -ForegroundColor Green
Write-Host " - Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host " - Frontend: http://localhost:5173" -ForegroundColor Cyan
