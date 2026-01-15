@echo off
echo Building SdTracker standalone installer...

REM Build backend
echo Building backend API...
cd go-backend
go build -o ..\frontend\src-tauri\resources\backend-api.exe cmd\api\main.go
cd ..

REM Build parser
echo Building parser...
cd parser
go build -o ..\frontend\src-tauri\resources\parser.exe cmd\sdtracker\main.go
cd ..

REM Build Tauri app
echo Building Tauri application...
cd frontend
npm run tauri build

echo Build complete! Installers are in frontend\src-tauri\target\release\bundle\
pause
