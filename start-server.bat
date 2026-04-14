@echo off
cd /d "%~dp0server"
echo.
echo === LipaMove local server ===
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Install LTS from https://nodejs.org then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing npm dependencies ^(first run only^)...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install failed. Check the messages above.
    pause
    exit /b 1
  )
  echo.
)

echo Starting server on http://127.0.0.1:3000
echo Open in your browser: http://127.0.0.1:3000/
echo If the window closes immediately, scroll up for errors.
echo.
npm start
if errorlevel 1 (
  echo.
  echo Server exited with an error. See messages above.
  pause
)
