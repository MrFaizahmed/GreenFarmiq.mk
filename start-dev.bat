@echo off
echo Starting GreenFarmIQ Agricultural Marketplace...

echo.
echo Setting up environment...
set NODE_ENV=development

echo.
echo Starting backend server...
cd backend
start cmd /k "npm run dev"

echo.
echo Starting frontend server...
cd ../frontend
start cmd /k "npm run dev"

echo.
echo Applications are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul