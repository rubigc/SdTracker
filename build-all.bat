@echo off
echo Building SdTracker standalone installer...

REM Build parser
echo Building parser...
if not exist frontend\src-tauri\resources mkdir frontend\src-tauri\resources
cd parser
go build -o ..\frontend\src-tauri\resources\parser.exe cmd\sdtracker\main.go
cd ..

REM Copy data files
echo Copying data files...
if not exist frontend\src-tauri\resources\data mkdir frontend\src-tauri\resources\data
copy parser\data\*.json frontend\src-tauri\resources\data\

REM Build Tauri app
echo Building Tauri application...
cd frontend
npm run tauri build

echo Build complete! Installers are in frontend\src-tauri\target\release\bundle\
pause
