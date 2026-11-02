@echo off
title Gene's Business System - Local Dev Server
echo ===================================================
echo   Starting Gene's Business System (Vite Dev Server)
echo ===================================================

cd /d "%~dp0"

echo.
echo Starting Vite development server at http://localhost:5173 ...
echo Press Ctrl+C in this window to stop the server.
echo.

start "" "http://localhost:5173"
call npm run dev
pause

