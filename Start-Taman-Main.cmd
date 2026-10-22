@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Open Taman-Main.html from the extracted folder instead.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4173"
echo Taman Main is running at http://127.0.0.1:4173
echo Keep this window open. Press Ctrl+C to stop the server.
node server.mjs
pause
