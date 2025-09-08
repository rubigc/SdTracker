#!/bin/bash

# SdTracker Startskript für macOS
# Dieses Skript installiert alle Abhängigkeiten und startet die Anwendung in der richtigen Reihenfolge

set -e  # Beende das Skript bei Fehlern

echo "🚀 SdTracker Startskript für macOS"
echo "================================="

# Funktion zur Überprüfung, ob ein Befehl existiert
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Funktion zur Überprüfung, ob ein Port belegt ist
port_occupied() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Schritt 1: Überprüfe die notwendigen Tools
echo "📋 Schritt 1: Überprüfe Systemvoraussetzungen..."

if ! command_exists go; then
    echo "❌ Go ist nicht installiert. Bitte installiere Go 1.23 oder höher."
    echo "   Du kannst Go mit Homebrew installieren: brew install go"
    echo "   Oder von https://golang.org/dl/ herunterladen"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js ist nicht installiert. Bitte installiere Node.js 18 oder höher."
    echo "   Du kannst Node.js mit Homebrew installieren: brew install node"
    echo "   Oder von https://nodejs.org/ herunterladen"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm ist nicht installiert. Bitte installiere npm."
    echo "   npm wird normalerweise mit Node.js mitgeliefert"
    exit 1
fi

echo "✅ Systemvoraussetzungen sind erfüllt"

# Schritt 2: Datenbank initialisieren
echo ""
echo "🗄️  Schritt 2: Datenbank initialisieren..."

if [ ! -f "pokemon_stats.db" ]; then
    echo "📝 Erstelle Datenbank..."
    cd gobackend
    go run ./cmd/database/initDb.go
    cd ..
    echo "✅ Datenbank erfolgreich initialisiert"
else
    echo "✅ Datenbank existiert bereits"
fi

# Schritt 3: Go-Abhängigkeiten installieren
echo ""
echo "📦 Schritt 3: Installiere Go-Abhängigkeiten..."
cd gobackend
go mod download
go mod tidy
cd ..
echo "✅ Go-Abhängigkeiten installiert"

# Schritt 4: Node.js/React-Abhängigkeiten installieren
echo ""
echo "📦 Schritt 4: Installiere Node.js/React-Abhängigkeiten..."

# Backend
echo "📦 Installiere Backend-Abhängigkeiten..."
cd website/backend
npm install
cd ../..

# Frontend
echo "📦 Installiere Frontend-Abhängigkeiten..."
cd website/frontend
npm install
cd ../..

echo "✅ Node.js/React-Abhängigkeiten installiert"

# Schritt 5: Überprüfe Port-Konflikte
echo ""
echo "🔍 Schritt 5: Überprüfe Port-Konflikte..."

PORTS=(8098 3001 3000)
for port in "${PORTS[@]}"; do
    if port_occupied $port; then
        echo "⚠️  Port $port ist bereits belegt. Bitte beende den laufenden Dienst."
        echo "   Du kannst den Prozess mit 'lsof -ti:$port | xargs kill' beenden"
    fi
done

# Schritt 6: Starte die Dienste in der richtigen Reihenfolge
echo ""
echo "🚀 Schritt 6: Starte Dienste..."

# Username abfragen
read -p "Bitte gib deinen Showdown Username ein: " username
export SHOWDOWN_USERNAME=$username
echo "✅ Username gesetzt: $username"

# Starte sdtracker im Hintergrund
echo "🔧 Starte sdtracker (Go Backend)..."
cd gobackend
SHOWDOWN_USERNAME=$username go run ./cmd/sdtracker/main.go &
SDTRACKER_PID=$!
cd ..
echo "✅ sdtracker gestartet (PID: $SDTRACKER_PID)"

# Warte kurz, damit sdtracker starten kann
sleep 3

# Starte Node.js Backend im Hintergrund
echo "🔧 Starte Node.js Backend..."
cd website/backend
npm start &
BACKEND_PID=$!
cd ../..
echo "✅ Node.js Backend gestartet (PID: $BACKEND_PID)"

# Warte kurz, damit Backend starten kann
sleep 2

# Starte Frontend im Vordergrund
echo "🔧 Starte Frontend..."
cd website/frontend
echo "✅ Frontend wird gestartet. Öffne http://localhost:3000 im Browser"
# Öffne den Browser automatisch
if command_exists open; then
    open http://localhost:3000
elif command_exists xdg-open; then
    xdg-open http://localhost:3000
fi

npm start

# Aufräumen bei Skript-Ende
cleanup() {
    echo ""
    echo "🛑 Beende alle Dienste..."
    if [ ! -z "$SDTRACKER_PID" ]; then
        kill $SDTRACKER_PID 2>/dev/null || true
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    echo "✅ Alle Dienste beendet"
    exit 0
}

# Setze Signal-Handler
trap cleanup SIGINT SIGTERM

# Warte auf das Ende des Frontend-Prozesses
wait