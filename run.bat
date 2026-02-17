@echo off
echo Starting GreenFarmIQ Agricultural Marketplace...
echo.

echo Make sure MongoDB is running before proceeding!
echo.
echo Starting backend server...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start cmd /k "cd frontend && npm run dev"

echo.
echo Application started successfully!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo.
echo Close this window when done.
pause