package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

// Connect establishes a connection to the SQLite database
func Connect() (*sql.DB, error) {
	// Get the database path from environment or use default
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		// Default to a database file in the current directory
		dbPath = "./sdtracker.db"
	}

	// Ensure the directory exists
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open database connection
	conn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(5)

	DB = conn
	log.Printf("Connected to database at: %s", dbPath)

	return conn, nil
}

// Close closes the database connection
func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

// GetDB returns the database connection
func GetDB() *sql.DB {
	return DB
}

// InitSchema initializes the database schema if it doesn't exist
func InitSchema() error {
	if DB == nil {
		return fmt.Errorf("database connection not initialized")
	}

	// Create games table
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS games (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			game_number INTEGER NOT NULL,
			winner TEXT NOT NULL,
			player_name TEXT NOT NULL,
			player_team TEXT NOT NULL,
			player_lead TEXT NOT NULL,
			player_tera TEXT NOT NULL,
			player_ots TEXT NOT NULL,
			opponent_name TEXT NOT NULL,
			opponent_team TEXT NOT NULL,
			opponent_lead TEXT NOT NULL,
			opponent_tera TEXT NOT NULL,
			opponent_ots TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create games table: %w", err)
	}

	// Create indexes for better query performance
	_, err = DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_games_player_name ON games(player_name);
		CREATE INDEX IF NOT EXISTS idx_games_winner ON games(winner);
		CREATE INDEX IF NOT EXISTS idx_games_player_lead ON games(player_lead);
		CREATE INDEX IF NOT EXISTS idx_games_player_tera ON games(player_tera);
	`)
	if err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	log.Println("Database schema initialized successfully")
	return nil
}
