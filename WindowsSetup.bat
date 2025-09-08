@echo off
setlocal

REM === Install path inside user profile (no admin needed) ===
set "INSTALL_PATH=%USERPROFILE%\msys2"

REM === Temp file for installer ===
set "MSYS_INSTALLER=%TEMP%\msys2.exe"

echo [1/4] Downloading MSYS2 installer...
powershell -Command "Invoke-WebRequest -Uri https://github.com/msys2/msys2-installer/releases/latest/download/msys2-x86_64-latest.exe -OutFile '%MSYS_INSTALLER%'"

echo [2/4] Running silent install...
"%MSYS_INSTALLER%" /S /D=%INSTALL_PATH%

echo [3/4] Updating MSYS2 and installing GCC...
"%INSTALL_PATH%\usr\bin\bash.exe" -lc "pacman -Syuu --noconfirm"
"%INSTALL_PATH%\usr\bin\bash.exe" -lc "pacman -Sy --noconfirm mingw-w64-x86_64-gcc"

echo [4/4] Adding GCC to USER PATH...
set "GCC_PATH=%INSTALL_PATH%\mingw64\bin"
powershell -Command "[Environment]::SetEnvironmentVariable('Path', $env:Path + ';%GCC_PATH%', 'User')"

echo ✅ GCC installed for your user only.
echo 🔄 Restart your terminal (or log out/in) and run: gcc --version
pause
