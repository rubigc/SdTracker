# SdTracker

A Program to track Showdown games and ELO inspired by Poker hand trackers.

## Overview

SdTracker is a comprehensive Pokemon Showdown game tracking system with a desktop frontend application. It allows you to:

- Track Pokemon Showdown games automatically
- View detailed player statistics and winrates
- Analyze lead Pokemon and Terastallization type performance
- Review complete game history
- Test and explore REST API

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

#### Development Mode:
1. **Start Backend API**:
   ```bash
   cd go-backend
   go run cmd/api/main.go
   ```

2. **Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm run tauri dev
   ```

The Tauri application will open and you can:
- Start the parser from the Parser Dashboard
- View statistics from the Statistics Dashboard
- Test API endpoints from the API Explorer

#### Building Standalone Installer:

For creating a distributable installer that includes all components:

**Linux/macOS:**
```bash
cd frontend
chmod +x build-all.sh
./build-all.sh
```

**Windows:**
```batch
cd frontend
build-all.bat
```

This will:
1. Compile Go backend to executable
2. Compile Go parser to executable
3. Copy executables to resources directory
4. Build Tauri application with bundled resources
5. Generate platform-specific installer (NSIS/DMG/AppImage)

See [`frontend/STANDALONE_IMPLEMENTATION.md`](frontend/STANDALONE_IMPLEMENTATION.md) for details on the standalone packaging implementation.

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
│   │   ├── components/      # React components
│   │   │   ├── common/      # Shared UI components
│   │   │   ├── parser/      # Parser management components
│   │   │   └── stats/       # Statistics components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── src-tauri/          # Rust backend
│   │   ├── src/
│   │   │   ├── main.rs      # Tauri entry point
│   │   │   ├── lib.rs       # Library exports and commands
│   │   │   ├── backend.rs    # Backend process manager
│   │   │   └── parser.rs     # Parser process manager
│   │   ├── Cargo.toml       # Rust dependencies
│   │   └── tauri.conf.json  # Tauri configuration
│   ├── build-all.sh         # Linux/macOS build script
│   ├── build-all.bat         # Windows build script
│   └── package.json         # Node dependencies
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

## Documentation

- [Frontend Architecture Plan](plans/tauri-frontend-plan.md)
- [Standalone Packaging Plan](plans/standalone-packaging-plan.md)
- [Standalone Implementation Guide](frontend/STANDALONE_IMPLEMENTATION.md)
- [Frontend README](frontend/README.md)

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

## License

See LICENSE file for details.
