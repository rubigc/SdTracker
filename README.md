# SdTracker

## Docker Setup

### Prerequisites
- Docker installed
- Docker Compose (optional but recommended)

### Quick Start with Docker

#### For macOS/Linux:
1. Download and extract the repository
2. Open terminal in the extracted folder
3. Run either option below:

##### Option 1: Using docker-compose (recommended)
```bash
docker-compose up -d
```

##### Option 2: Manual Docker commands
```bash
docker build -t sdtracker .
mkdir database  # Creates directory for persistent data
docker run -d \
  -p 8089:8080 \
  -p 3000:3000 \
  -p 3001:3001 \
  -v $(pwd)/database:/app/database \
  --name sdtracker \
  sdtracker
```

#### For Windows:
1. Download and extract the repository
2. Open PowerShell in the extracted folder
3. Run either option below:

##### Option 1: Using docker-compose (recommended)
```powershell
docker-compose up -d
```

##### Option 2: Manual Docker commands
```powershell
docker build -t sdtracker .
mkdir database  # Creates directory for persistent data
docker run -d `
  -p 8089:8080 `
  -p 3000:3000 `
  -p 3001:3001 `
  -v ${PWD}/database:/app/database `
  --name sdtracker `
  sdtracker
```

### Accessing the Application
- Frontend: http://localhost:3000
- Go Backend API: http://localhost:8089
- Node.js API: http://localhost:3001

### Data Management
The database is stored in `./database/pokemon_stats.db` and persists between container restarts.

#### Backup database:
```bash
cp ./database/pokemon_stats.db ./backup_$(date +%Y%m%d).db
```

#### Restore backup:
```bash
cp ./backup_file.db ./database/pokemon_stats.db
```

### Development Notes
For development without Docker, use the original `run_all.sh` script.
A Program to track Showdown games and ELO inspired by Poker hand trackers

## System Requirements
- Go 1.18+
- Node.js 16+
- npm 8+
- SQLite3

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
   - Run `go run ./cmd/database/initDb.go` to initialize

## Running the Application

### Option 1: Run components separately
1. Go Backend: `go run ./cmd/sdtracker/main.go` (Port: 8098)
2. Node.js Backend: `cd website/backend && npm start` (Port: 3001)
3. Frontend: `cd website/frontend && npm start` (Port: 3000)

### Option 2: Use the run script
Run `./run_all.sh <your_showdown_username>` to start all components

## Port Configuration
- Go Backend: 8098
- Node.js API: 3001
- Frontend: 3000

## Database Schema
The database contains tables for:
- Matches
- Games
- Game players with team/lead/tera information
