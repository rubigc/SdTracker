# SdTracker Frontend

A Tauri desktop application for managing Pokemon Showdown game tracking and viewing statistics.

## Features

- **Parser Dashboard**: Start and stop the Pokemon Showdown replay parser
- **Statistics Dashboard**: View detailed player statistics including winrates, lead stats, tera stats, and game history
- **API Explorer**: Test and explore backend REST API endpoints

## Prerequisites

- Node.js 18+ and npm
- Rust and Cargo
- Go (for running the backend and parser)

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run tauri dev
```

This will:
1. Start the Go backend API on port 3001
2. Start the Vite development server
3. Open the Tauri application window

## Building

### Build for Production

```bash
npm run tauri build
```

This will create a distributable package for your operating system in the `src-tauri/target/release/bundle/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared UI components
│   │   ├── parser/      # Parser management components
│   │   └── stats/       # Statistics display components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── src-tauri/          # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs      # Tauri entry point
│   │   ├── lib.rs       # Library exports and commands
│   │   └── parser.rs    # Parser process management
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
└── package.json         # Node dependencies
```

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Desktop Framework**: Tauri 2.x
- **Backend**: Rust for Tauri commands

## API Endpoints

The application connects to the Go backend API running on `http://localhost:3001`:

- `GET /api/winrates/:name` - Player winrate statistics
- `GET /api/leads/:name` - Lead Pokemon statistics
- `GET /api/tera/:name` - Terastallization type statistics
- `GET /api/history/:name` - Game history for a player

## Parser

The parser runs on port 8098 and accepts replay URLs via:

- `POST /receive-logs` - Accepts replay URLs from Pokemon Showdown

The parser requires a `SHOWDOWN_USERNAME` environment variable to be set.

## Configuration

### Tauri Configuration

Edit `src-tauri/tauri.conf.json` to configure:

- Window size and properties
- Build settings
- Bundle targets
- Security settings

### Backend URL

The backend URL is configured in `src/services/api.ts`. Change the `API_BASE` constant if your backend runs on a different port or host.

## Troubleshooting

### Backend Not Starting

If the backend doesn't start automatically:
1. Ensure Go is installed and in your PATH
2. Check that port 3001 is not already in use
3. Manually start the backend: `cd ../go-backend && go run cmd/api/main.go`

### Parser Not Starting

If the parser doesn't start:
1. Ensure Go is installed and in your PATH
2. Check that port 8098 is not already in use
3. Verify the parser directory structure is correct

### Build Errors

If you encounter build errors:
1. Ensure all dependencies are installed: `npm install`
2. Clear the cache: `rm -rf node_modules && npm install`
3. Check Rust toolchain: `rustc --version`

## License

See the main project LICENSE file.
