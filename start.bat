@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM SdTracker Startskript für Windows
REM Dieses Skript installiert alle Abhängigkeiten und startet die Anwendung in der richtigen Reihenfolge

echo 🚀 SdTracker Startskript für Windows
echo ================================

REM Funktion zur Überprüfung, ob ein Befehl existiert
where >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Fehler: Befehlsüberprüfung fehlgeschlagen
    pause
    exit /b 1
)

REM Funktion zur Überprüfung, ob ein Programm installiert ist
:command_exists
where %1 >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 0
) else (
    exit /b 1
)

REM Schritt 1: Überprüfe die notwendigen Tools
echo 📋 Schritt 1: Überprüfe Systemvoraussetzungen...

if not exist "go.exe" (
    if not exist "C:\Go\bin\go.exe" (
        echo ❌ Go ist nicht installiert oder nicht im PATH. Bitte installiere Go 1.23 oder höher.
        echo    Download: https://golang.org/dl/
        pause
        exit /b 1
    ) else (
        set "PATH=C:\Go\bin;%PATH%"
        echo ✅ Go gefunden in C:\Go\bin
    )
)

if not exist "node.exe" (
    if not exist "C:\Program Files\nodejs\node.exe" (
        if not exist "C:\Program Files (x86)\nodejs\node.exe" (
            echo ❌ Node.js ist nicht installiert oder nicht im PATH. Bitte installiere Node.js 18 oder höher.
            echo    Download: https://nodejs.org/
            pause
            exit /b 1
        ) else (
            set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
            echo ✅ Node.js gefunden in C:\Program Files (x86)\nodejs
        )
    ) else (
        set "PATH=C:\Program Files\nodejs;%PATH%"
        echo ✅ Node.js gefunden in C:\Program Files\nodejs
    )
)

if not exist "npm.exe" (
    echo ❌ npm ist nicht installiert. Bitte installiere npm mit Node.js.
    pause
    exit /b 1
)

echo ✅ Systemvoraussetzungen sind erfüllt

REM Schritt 2: Datenbank initialisieren
echo.
echo 🗄️  Schritt 2: Datenbank initialisieren...

if not exist "pokemon_stats.db" (
    echo 📝 Erstelle Datenbank...
    cd gobackend
    if exist "go.exe" (
        go run cmd\database\initDb.go
    ) else (
        go run cmd\database\initDb.go
    )
    cd ..
    echo ✅ Datenbank erfolgreich initialisiert
) else (
    echo ✅ Datenbank existiert bereits
)

REM Schritt 3: Go-Abhängigkeiten installieren
echo.
echo 📦 Schritt 3: Installiere Go-Abhängigkeiten...
cd gobackend
go mod download
go mod tidy
cd ..
echo ✅ Go-Abhängigkeiten installiert

REM Schritt 4: Node.js/React-Abhängigkeiten installieren
echo.
echo 📦 Schritt 4: Installiere Node.js/React-Abhängigkeiten...

REM Backend
echo 📦 Installiere Backend-Abhängigkeiten...
cd website\backend
call npm install
cd ..\..

REM Frontend
echo 📦 Installiere Frontend-Abhängigkeiten...
cd website\frontend
call npm install
cd ..\..

echo ✅ Node.js/React-Abhängigkeiten installiert

REM Schritt 5: Überprüfe Port-Konflikte
echo.
echo 🔍 Schritt 5: Überprüfe Port-Konflikte...

for %%p in (8098 3001 3000) do (
    netstat -ano | findstr "%%p" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠️  Port %%p ist bereits belegt. Bitte beende den laufenden Dienst.
        echo    Du kannst den Prozess mit 'taskkill /PID [PID] /F' beenden
    )
)

REM Schritt 6: Starte die Dienste in der richtigen Reihenfolge
echo.
echo 🚀 Schritt 6: Starte Dienste...

REM Username abfragen
set /p username="Bitte gib deinen Showdown Username ein: "
set "SHOWDOWN_USERNAME=%username%"
echo ✅ Username gesetzt: %username%

REM Starte sdtracker im Hintergrund (neues Fenster)
echo 🔧 Starte sdtracker (Go Backend)...
start "sdtracker" cmd /k "cd /d \"%CD%\gobackend\" ^&^& set SHOWDOWN_USERNAME=%username% ^&^& go run cmd\sdtracker\main.go ^&^& pause"

REM Warte kurz, damit sdtracker starten kann
timeout /t 3 /nobreak >nul

REM Starte Node.js Backend im Hintergrund (neues Fenster)
echo 🔧 Starte Node.js Backend...
start "Node.js Backend" cmd /k "cd /d \"%CD%\website\backend\" ^&^& npm start ^&^& pause"

REM Warte kurz, damit Backend starten kann
timeout /t 2 /nobreak >nul

REM Starte Frontend im aktuellen Fenster
echo 🔧 Starte Frontend...
echo ✅ Frontend wird gestartet. Öffne http://localhost:3000 im Browser
cd website\frontend
call npm start

REM Aufräumen bei Skript-Ende
echo.
echo 🛑 Beende alle Dienste...
taskkill /FI "WINDOWTITLE eq sdtracker*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Node.js Backend*" /F >nul 2>&1
echo ✅ Alle Dienste beendet
pause