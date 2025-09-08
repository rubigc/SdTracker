@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "SCRIPT_NAME=SdTracker Startskript"
echo %SCRIPT_NAME% fuer Windows
echo ================================

echo Ueberpruefe Systemvoraussetzungen...

:: Go prüfen
where go >nul 2>&1
if errorlevel 1 (
    echo Fehler: Go ist nicht im PATH. Bitte installiere Go 1.23 oder hoeher.
    echo Download: https://golang.org/dl/
    pause
    exit /b 1
) else (
    for /f "delims=" %%i in ('where go') do set "GO_PATH=%%i"
    echo Go gefunden: !GO_PATH!
)

:: Node.js prüfen
where node >nul 2>&1
if errorlevel 1 (
    echo Fehler: Node.js ist nicht im PATH. Bitte installiere Node.js 18 oder hoeher.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "delims=" %%i in ('where node') do set "NODE_PATH=%%i"
    echo Node.js gefunden: !NODE_PATH!
)

:: npm prüfen
where npm >nul 2>&1
if errorlevel 1 (
    echo Fehler: npm ist nicht im PATH. Bitte installiere Node.js inkl. npm.
    pause
    exit /b 1
) else (
    for /f "delims=" %%i in ('where npm') do set "NPM_PATH=%%i"
    echo npm gefunden: !NPM_PATH!
)

echo Systemvoraussetzungen sind erfuellt

echo.
echo Datenbank initialisieren...

if not exist "pokemon_stats.db" (
    echo Erstelle Datenbank...
    cd gobackend
    go run cmd\database\initDb.go
    cd ..
    echo Datenbank erfolgreich initialisiert
) else (
    echo Datenbank existiert bereits
)

echo.
echo Installiere Go-Abhaengigkeiten...
cd gobackend
go mod download
go mod tidy
cd ..
echo Go-Abhaengigkeiten installiert

echo.
echo Installiere Node.js/React-Abhaengigkeiten...

echo Installiere Backend-Abhaengigkeiten...
cd website\backend
call npm install
cd ..\..

echo Installiere Frontend-Abhaengigkeiten...
cd website\frontend
call npm install
cd ..\..

echo Node.js/React-Abhaengigkeiten installiert

echo.
echo Ueberpruefe Port-Konflikte...

for %%p in (8098 3001 3000) do (
    netstat -ano | findstr "%%p" >nul 2>&1
    if !errorlevel! equ 0 (
        echo Port %%p ist bereits belegt. Bitte beende den laufenden Dienst.
        echo Du kannst den Prozess mit ^'taskkill /PID [PID] /F^' beenden
    )
)

echo.
echo Starte Dienste...

set /p username="Bitte gib deinen Showdown Username ein: "
set "SHOWDOWN_USERNAME=%username%"
echo Username gesetzt: %username%

echo Starte sdtracker (Go Backend)...
start "sdtracker" cmd /k "cd /d \"%CD%\gobackend\" ^&^& set SHOWDOWN_USERNAME=%username% ^&^& go run cmd\sdtracker\main.go ^&^& pause"

timeout /t 3 /nobreak >nul

echo Starte Node.js Backend...
start "Node.js Backend" cmd /k "cd /d \"%CD%\website\backend\" ^&^& npm start ^&^& pause"

timeout /t 2 /nobreak >nul

echo Starte Frontend...
echo Frontend wird gestartet. Oeffne http://localhost:3000 im Browser
cd website\frontend
call npm start

echo.
echo Beende alle Dienste...
taskkill /FI "WINDOWTITLE eq sdtracker*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Node.js Backend*" /F >nul 2>&1
echo Alle Dienste beendet
pause
