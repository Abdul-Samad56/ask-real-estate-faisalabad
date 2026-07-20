@echo off
cd /d "%~dp0server"
if not exist .env (
  echo COPY .env.example to .env and set MONGODB_URI first!
  pause
  exit /b 1
)
start "ASK API" cmd /k "npm run dev"
cd /d "%~dp0client"
start "ASK Web" cmd /k "npm run dev"
echo API http://localhost:5000
echo Web http://localhost:5173
timeout /t 3
