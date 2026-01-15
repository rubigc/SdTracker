# Resources Directory

This directory contains external resources that are bundled with the Tauri application.

## Structure

- `parser` - The Go parser executable (built from the parser directory)
- `backend-api` - The Rust backend API executable
- `data/` - JSON data files used by the Go parser
  - `abilities.json` - Pokemon abilities data
  - `items.json` - Pokemon items data
  - `moves.json` - Pokemon moves data

## How It Works

When the Tauri app is built, all files in this directory are copied to the application's resources folder next to the executable. The parser is started with this resources directory as its working directory, allowing it to access the data files via relative paths (e.g., `./data/moves.json`).

## Updating Data Files

If you need to update the JSON data files:
1. Update the source files in `parser/data/`
2. Copy them to this directory: `cp parser/data/*.json frontend/src-tauri/resources/data/`

The files will be automatically bundled with the next Tauri build.
