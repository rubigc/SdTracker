# SdTracker Frontend

A Tauri desktop application for managing Pokemon Showdown game tracking and viewing statistics.

## Features

- **Parser Dashboard**: Start/stop the replay parser and upload replays manually
- **Statistics Dashboard**: Winrates, leads, tera usage, match history
- **Teams**: Manage accounts and teams
- **Move Usage**: Move usage stats and win rates
- **API Explorer**: Explore backend API endpoints

## Prerequisites

- Node.js 18+ and npm
- Rust and Cargo
- Go (for the parser binary)

## Development

### Install dependencies

```bash
npm install
```

### Build the parser resource

```bash
cd ../parser
go build -o ../frontend/src-tauri/resources/parser cmd/sdtracker/main.go
```

### Run the app

```bash
npm run tauri dev
```

In the app:
1. Start the API server (API Server control panel)
2. Start the parser (Parser Control panel)

## Building

### Production build

```bash
npm run tauri build
```

This creates a distributable package in `src-tauri/target/release/bundle/`.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── src-tauri/           # Tauri Rust backend
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## Backend API

The API server runs on `http://localhost:3001` when started from the app.

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

## Parser API

The parser runs on port 8098 and accepts:

- `POST /receive-logs`
- `POST /upload-replay`
- `POST /paste-replay`

## Troubleshooting

### Parser not starting

- Ensure the parser binary exists at `src-tauri/resources/parser`
- Check that port 8098 is not already in use

### API server not starting

- Check that port 3001 is not already in use
- Restart the app and try again

## License

See the main project LICENSE file.
