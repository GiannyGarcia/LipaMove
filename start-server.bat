@echo off
setlocal EnableExtensions
title LipaMove Server

cd /d "%~dp0server"
if errorlevel 1 (
  echo ERROR: Could not change to the server folder.
  echo This .bat file should stay next to the "server" folder.
  echo.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo ERROR: server\package.json not found.
  echo Current folder: %CD%
  echo Expected: the LipaMove project folder containing "server" and this .bat file.
  echo.
  pause
  exit /b 1
)

echo.
echo === LipaMove local server ===
echo Folder: %CD%
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Install LTS from https://nodejs.org then reopen this window.
  echo Tip: close and reopen File Explorer after installing Node.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js ^(LTS^) from https://nodejs.org
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing npm dependencies ^(first run only^)...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed. Read the messages above ^(MySQL optional for first UI test^).
    echo.
    pause
    exit /b 1
  )
  echo.
)

echo Starting server...
echo Browser: http://127.0.0.1:3000/
echo Press Ctrl+C here to stop the server.
echo.
call npm start
set EXITCODE=%ERRORLEVEL%

echo.
echo ----- Server process ended ^(exit code %EXITCODE%^) -----
if not "%EXITCODE%"=="0" (
  echo If you see MySQL errors, copy server\.env.example to server\.env and set MYSQL_*.
)
echo.
pause
endlocal
exit /b %EXITCODE%
