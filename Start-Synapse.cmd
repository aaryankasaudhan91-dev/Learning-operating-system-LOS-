@echo off
cd /d "%~dp0"
echo Starting Synapse local website, app, mobile preview and backend.
echo Website: http://127.0.0.1:5174/
echo App:     http://127.0.0.1:5173/
echo Mobile:  http://127.0.0.1:5175/
echo Keep this window open. Press Ctrl+C to stop.
call npm run dev:all
pause
