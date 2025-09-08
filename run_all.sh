#!/bin/bash

# Start Go Backend
echo "Starting Go Backend..."
cd gobackend
go run ./cmd/sdtracker/main.go &
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