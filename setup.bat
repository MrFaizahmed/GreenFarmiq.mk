@echo off
echo Setting up GreenFarmIQ Agricultural Marketplace...
echo.

echo Installing backend dependencies...
cd backend
npm install
echo.

echo Installing frontend dependencies...
cd ../frontend
npm install
echo.

echo Setup complete!
echo.
echo To run the application:
echo 1. Make sure MongoDB is running
echo 2. Open first terminal: cd backend ^&^& npm run dev
echo 3. Open second terminal: cd frontend ^&^& npm run dev
echo.
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:5000
echo.
pause