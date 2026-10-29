@echo off
cd /d "%~dp0"
echo Opening Synapse desktop development mode.
echo Changes to the shared frontend appear automatically.
call npm run desktop:dev
pause
