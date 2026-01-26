#!/bin/bash

set -e

echo "Building SdTracker standalone installer..."

# Build parser
echo "Building parser..."
mkdir -p frontend/src-tauri/resources
cd parser
go build -o ../frontend/src-tauri/resources/parser cmd/sdtracker/main.go
cd ..

# Copy data files
echo "Copying data files..."
mkdir -p frontend/src-tauri/resources/data
cp parser/data/*.json frontend/src-tauri/resources/data/

# Build Tauri app
echo "Building Tauri application..."
cd frontend
npm run tauri build

echo "Build complete! Installers are in frontend/src-tauri/target/release/bundle/"
