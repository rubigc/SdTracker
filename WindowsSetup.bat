@echo off
setlocal

echo [1/4] Checking if PowerShell ExecutionPolicy allows scripts...
powershell -Command "if ((Get-ExecutionPolicy) -eq 'Restricted') { Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force }"

echo [2/4] Installing Scoop (if not installed)...
powershell -Command "if (!(Get-Command scoop -ErrorAction SilentlyContinue)) { iwr -useb get.scoop.sh | iex }"

echo [3/4] Installing GCC via Scoop...
powershell -Command "scoop install gcc"

echo [4/4] Done! 🎉
echo Restart your terminal or open a new cmd/powershell and type: gcc --version
pause
