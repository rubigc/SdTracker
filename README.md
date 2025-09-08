# SdTracker
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

### Option 2: Use the dev script
Run `./website/dev.sh` to start both Node.js backend and frontend

## Port Configuration
- Go Backend: 8098
- Node.js API: 3001
- Frontend: 3000

## Database Schema
The database contains tables for:
- Matches
- Games
- Game players with team/lead/tera information
