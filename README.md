# SdTracker

A Program to track Showdown games and ELO inspired by Poker hand trackers.

## Overview

SdTracker is a comprehensive Pokemon Showdown game tracking system with a desktop frontend application. It allows you to:

- Track Pokemon Showdown games automatically
- View detailed player statistics and winrates
- Analyze lead Pokemon and Terastallization type performance
- Review complete game history
- Test and explore the REST API

## Components

### Backend (Go)
- REST API server running on port 3001
- SQLite database for storing game data
- Endpoints for winrates, lead stats, tera stats, and history

### Parser (Go)
- HTTP server running on port 8098
- Receives replay URLs from Pokemon Showdown
- Processes and stores game data in the database

### Frontend (Tauri + React)
- Desktop application for managing parser and viewing statistics
- Parser Dashboard: Start/stop parser and monitor status
- Statistics Dashboard: View detailed player statistics
- API Explorer: Test backend endpoints interactively

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+ and npm
- Rust and Cargo (for building Tauri app)

### Running the Application

1. **Start the Backend API**:
   ```bash
   cd go-backend
   go run cmd/api/main.go
   ```

2. **Run the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run tauri dev
   ```

The Tauri application will open and you can:
- Start the parser from the Parser Dashboard
- View statistics from the Statistics Dashboard
- Test API endpoints from the API Explorer

## Project Structure

```
SdTracker/
├── go-backend/              # Go backend API
│   ├── cmd/api/            # API server entry point
│   ├── pkg/                # Backend packages
│   │   ├── api/           # API handlers
│   │   ├── db/            # Database queries
│   │   ├── models/         # Data models
│   │   └── service/       # Business logic
│   └── go.mod
├── parser/                 # Go parser
│   ├── cmd/sdtracker/      # Parser entry point
│   ├── pkg/                # Parser packages
│   └── go.mod
├── frontend/               # Tauri desktop app
│   ├── src/                # React source
│   ├── src-tauri/          # Rust backend
│   └── package.json
└── plans/                  # Architecture plans
```

## API Endpoints

### Backend API (Port 3001)

- `GET /api/winrates/:name` - Get winrate statistics for a player
- `GET /api/leads/:name` - Get lead Pokemon statistics for a player
- `GET /api/tera/:name` - Get Terastallization type statistics for a player
- `GET /api/history/:name` - Get game history for a player

### Parser API (Port 8098)

- `POST /receive-logs` - Accept replay URLs from Pokemon Showdown

## Development

### Backend Development

```bash
cd go-backend
go run cmd/api/main.go
```

### Parser Development

```bash
cd parser
go run cmd/sdtracker/main.go
```

Note: Set the `SHOWDOWN_USERNAME` environment variable before running the parser.

### Frontend Development

```bash
cd frontend
npm install
npm run tauri dev
```

## Building

### Build Backend

```bash
cd go-backend
go build -o sdtracker-api cmd/api/main.go
```

### Build Parser

```bash
cd parser
go build -o sdtracker-parser cmd/sdtracker/main.go
```

### Build Frontend

```bash
cd frontend
npm run tauri build
```

This creates a distributable package in `frontend/src-tauri/target/release/bundle/`.

## Documentation

- [Frontend Architecture Plan](plans/tauri-frontend-plan.md)
- [Frontend README](frontend/README.md)

## License

See LICENSE file for details.

