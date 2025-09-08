#!/bin/bash

# Skript zum Starten von Frontend und Backend

# Funktion zum Beenden aller Prozesse bei Skriptende
cleanup() {
  echo "Beende alle Prozesse..."
  kill $FRONTEND_PID $BACKEND_PID
}
trap cleanup EXIT

# Starte das Backend
echo "Starte Backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Starte das Frontend
echo "Starte Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Warte auf die Prozesse
wait $FRONTEND_PID $BACKEND_PID