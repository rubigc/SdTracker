#!/bin/bash

echo "Building SdTracker standalone installer..."

# Build backend
echo "Building backend API..."
cd go-backend
go build -o ../frontend/src-tauri/resources/backend-api cmd/api/main.go
cd ..

# Build parser
echo "Building parser..."
cd parser
go build -o ../frontend/src-tauri/resources/parser cmd/sdtracker/main.go
cd ..

# Build Tauri app
echo "Building Tauri application..."
cd frontend
npm run tauri build

echo "Build complete! Installers are in frontend/src-tauri/target/release/bundle/"
