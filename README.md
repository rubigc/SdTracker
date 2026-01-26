# SdTracker

A desktop app to track Pokemon Showdown games, analyze performance, and manage teams/accounts.

## Features

- **Automatic tracking** of Pokemon Showdown replays
- **Manual replay upload** via URL, file upload, or HTML paste
- **Statistics dashboard** with winrates, leads, tera usage, and match history
- **Teams & accounts** management
- **Move usage** stats with win rates per move
- **Auto-start** for API server + parser (toggle in Settings)
- **API Explorer** for debugging endpoints

## Components

### Parser (Go)
- HTTP server on port 8098
- Receives replay URLs or HTML content
- Parses and stores game data

### API Server (Rust / Actix, inside Tauri)
- REST API on port 3001
- Serves stats, accounts, teams, and move usage
- Started/stopped from the app

### Frontend (Tauri + React)
- Desktop app for controlling services and viewing stats

## Quick Start (Development)

### Prerequisites

- Go 1.21+
- Node.js 18+ and npm
- Rust and Cargo (Tauri)

### Build the parser resource

The parser runs as a bundled resource in the app. Build it into the Tauri resources folder:

```bash
cd parser
go build -o ../frontend/src-tauri/resources/parser cmd/sdtracker/main.go
```

### Run the app

```bash
cd frontend
npm install
npm run tauri dev
```

## Using the App

1. **Auto-start**
   - The API server auto-starts on app launch.
   - The parser auto-starts if a username is saved.
   - Toggle auto-start in **Settings**.

2. **Start the parser (first time)**
   - Go to **Settings → Parser**
   - Enter your Pokemon Showdown username
   - Click **Start** to launch the parser

3. **Upload replays**
   - Use the **Parser Control** tabs to submit by URL, upload an HTML file, or paste HTML

4. **View stats**
   - Open **Statistics** to see winrates, leads, tera usage, and match history

5. **Manage teams**
   - Open **Teams** to create accounts, add teams, and view team stats

## Building a Standalone Installer

From the repo root:

**Linux/macOS**
```bash
chmod +x build-all.sh
./build-all.sh
```

**Windows**
```batch
build-all.bat
```

This will:
1. Build the parser binary
2. Copy parser data files into resources
3. Build the Tauri app and bundle everything

Installers are created in `frontend/src-tauri/target/release/bundle/`.

## Project Structure

```
SdTracker/
├── parser/                 # Go parser server
├── frontend/               # Tauri desktop app
│   ├── src/                # React source
│   ├── src-tauri/          # Rust backend + Tauri config
│   └── dist/               # Vite build output
├── plans/                  # Architecture / implementation plans
├── replays/                # Sample replays
├── screenshots/            # UI screenshots
├── build-all.sh            # Linux/macOS build script
└── build-all.bat           # Windows build script
```

## API Endpoints

### Backend API (Port 3001)

- `GET /api/winrates/:name`
- `GET /api/leads/:name`
- `GET /api/tera/:name`
- `GET /api/history/:name`
- `GET /api/accounts`
- `POST /api/accounts`
- `PUT /api/accounts/:id`
- `GET /api/teams`
- `GET /api/accounts/:id/teams`
- `POST /api/teams`
- `PUT /api/teams/:id`
- `DELETE /api/teams/:id`
- `GET /api/accounts/:id/moves?team_id=...`
- `GET /api/accounts/:id/moves/:pokemon`

### Parser API (Port 8098)

- `POST /receive-logs` (URL-based replay download)
- `POST /upload-replay` (HTML file upload)
- `POST /paste-replay` (paste HTML content)

## License

See LICENSE file for details.
