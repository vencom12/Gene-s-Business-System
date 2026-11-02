@echo off
title Gene's Business System - PHP Server
echo ===================================================
echo   Starting Gene's Business System via PHP Server
echo ===================================================

cd /d "%~dp0"

:: Check if PHP is available in PATH
set PHP_CMD=php
where php >nul 2>nul
if %ERRORLEVEL% equ 0 goto start_server

:: Check common XAMPP / Laragon paths
if exist "C:\xampp\php\php.exe" (
    set PHP_CMD="C:\xampp\php\php.exe"
    goto start_server
)
if exist "C:\laragon\bin\php\php-*\php.exe" (
    for /d %%i in ("C:\laragon\bin\php\php-*") do (
        if exist "%%i\php.exe" set PHP_CMD="%%i\php.exe"
    )
    goto start_server
)

echo.
echo [NOTICE] PHP was not found in your PATH or standard directories (C:\xampp\php\).
echo.
echo If you have PHP installed elsewhere, please add its folder to your system PATH.
echo.
echo NOTE: Since this application is built with React/Vite and Node.js is already installed,
echo you can run 'run_dev.bat' instead to test immediately without PHP!
echo.
pause
exit /b 1

:start_server
:: Ensure the production build exists
if not exist "%~dp0dist\index.html" (
    echo Building production files first...
    call npm run build
)

echo.
echo Serving from 'dist' directory...
echo URL: http://localhost:8000
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

start "" "http://localhost:8000"
%PHP_CMD% -S localhost:8000 -t dist
pause

