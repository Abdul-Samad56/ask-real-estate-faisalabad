@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\express" (
    echo Installing dependencies...
    call npm install
)

if exist ".env" (
    echo Starting DYNAMIC server ^(MongoDB Atlas^)...
    start "" "http://localhost:8000/"
    node mongo-atlas-server.js
    goto :end
)

echo.
echo  .env نہیں ملی — ابھی SQLite static/local موڈ چل رہا ہے۔
echo  Dynamic بنانے کے لیے:
echo    1. copy .env.example .env
echo    2. Atlas connection string .env میں لگائیں
echo    3. npm run seed
echo    4. start-local-server.bat دوبارہ چلائیں
echo.

where node >nul 2>nul
if %errorlevel%==0 (
    start "" "http://localhost:8000/"
    node node-local-server.js
    goto :end
)

where py >nul 2>nul
if %errorlevel%==0 (
    start "" "http://localhost:8000/"
    py local-server.py
    goto :end
)

echo Node.js install کریں۔
pause

:end
endlocal
