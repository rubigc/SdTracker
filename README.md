# SdTracker

A Program to track Showdown games and ELO inspired by Poker hand trackers.

## Quick Start (Recommended - No Docker Required)

### Prerequisites
- **Go 1.23+** 
- **Node.js 18+**
- **npm 8+**

### Quick Start by Operating System

#### For Linux:
```bash
# Make the start script executable
chmod +x start.sh

# Run the application
./start.sh
```

#### For macOS:
```bash
# Option 1: Using the terminal
chmod +x start.command
./start.command

# Option 2: Double-click the start.command file (recommended)
# This will automatically open the browser for you
```

#### For Windows:
```powershell
# Run the Windows start script
.\start.bat
```

Both scripts will:
- Check system requirements
- Install all dependencies automatically
- Initialize the database (if needed)
- Prompt for your Showdown username
- Start all services in the correct order
- Open the frontend at http://localhost:3000

### Manual Start (Alternative)
If you prefer manual setup:

1. **Install dependencies:**
```bash
# Go dependencies
cd gobackend
go mod download
cd ..

# Node.js dependencies
cd website/backend
npm install
cd ../frontend
npm install
cd ../..
```

2. **Initialize database:**
```bash
go run gobackend/cmd/dbinit/main.go
```

3. **Start services:**
```bash
# Set your username
export SHOWDOWN_USERNAME="your_username"

# Start services in order
cd gobackend && go run ./cmd/sdtracker/main.go &
cd ../website/backend && npm start &
cd ../frontend && npm start
```

## Accessing the Application
- **Frontend**: http://localhost:3000
- **Go Backend API**: http://localhost:8098
- **Node.js API**: http://localhost:3001

## System Requirements
- **Go 1.23+** (required for Go backend)
- **Node.js 18+** (required for frontend/backend)
- **npm 8+** (package manager for Node.js)
- **SQLite3** (database, usually included automatically)
- **At least 512MB RAM** (recommended for smooth operation)
- **Port availability**: 3000, 3001, 8098

## Installation

### Go Backend
1. Navigate to `gobackend` directory
2. Run `go mod download` to install dependencies
3. Build with `go build ./cmd/sdtracker`

### Node.js Backend
1. Navigate to `website/backend` directory
2. Run `npm install`

### Frontend
1. Navigate to `website/frontend` directory
2. Run `npm install`

## Configuration
1. Database: 
   - Default location: `./pokemon_stats.db`
   - Run `go run ./cmd/dbinit/main.go` to initialize

## Running the Application

### Option 1: Run components separately
1. Go Backend: `go run ./cmd/sdtracker/main.go` (Port: 8098)
2. Node.js Backend: `cd website/backend && npm start` (Port: 3001)
3. Frontend: `cd website/frontend && npm start` (Port: 3000)

### Option 2: Use the run script
Run `./start.sh` (Linux/macOS) or `.\start.bat` (Windows) to start all components

## Port Configuration
- Go Backend: 8098
- Node.js API: 3001
- Frontend: 3000

## Database Schema
The database contains tables for:
- Matches
- Games
- Game players with team/lead/tera information

## Troubleshooting

### Port Conflicts
If you get port conflicts, make sure these ports are available:
- 3000 (Frontend)
- 3001 (Node.js Backend)
- 8098 (Go Backend)

You can check port usage with:
```bash
# Linux/macOS
lsof -i :3000
lsof -i :3001
lsof -i :8098

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8098
```

### Missing Dependencies
If you encounter dependency errors:
1. Ensure Go 1.23+ and Node.js 18+ are installed
2. Run the start script again - it will reinstall dependencies
3. For manual setup, run dependency installation steps separately

### Database Issues
If you have database problems:
1. Delete `pokemon_stats.db` and restart the application
2. The database will be automatically recreated
3. Make sure you have write permissions in the project directory
