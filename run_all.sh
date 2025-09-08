#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <pokemon_showdown_username>"
    exit 1
fi

# Start Go Backend
echo "Starting Go Backend for user $1..."
cd gobackend
(echo "$1" | go run ./cmd/sdtracker/main.go) &
GO_PID=$!
cd ..

# Start Node.js Backend
echo "Starting Node.js Backend..."
cd website/backend
npm start &
NODE_PID=$!
cd ../..

# Start Frontend
echo "Starting Frontend..."
cd website/frontend
npm start &
FRONTEND_PID=$!
cd ../..

# Cleanup function
cleanup() {
  echo "Stopping all processes..."
  kill $GO_PID $NODE_PID $FRONTEND_PID
}
trap cleanup EXIT

# Wait for processes
wait $GO_PID $NODE_PID $FRONTEND_PID