package main

import (
	"database/sql"
	"fmt"
	"log"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "./pokemon_stats.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Create accounts table to track multiple player accounts
	createAccountsTable := `
	CREATE TABLE IF NOT EXISTS accounts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT UNIQUE NOT NULL,
		created_at TEXT DEFAULT CURRENT_TIMESTAMP,
		is_active INTEGER DEFAULT 1
	);`

	// Create teams table to store team compositions
	createTeamsTable := `
	CREATE TABLE IF NOT EXISTS teams (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		account_id INTEGER,
		team_data TEXT NOT NULL,
		created_at TEXT DEFAULT CURRENT_TIMESTAMP,
		last_used TEXT,
		games_played INTEGER DEFAULT 0,
		wins INTEGER DEFAULT 0,
		FOREIGN KEY (account_id) REFERENCES accounts(id)
	);`

	// Create team_usage table to track which team was used in which game
	createTeamUsageTable := `
	CREATE TABLE IF NOT EXISTS team_usage (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		game_id INTEGER NOT NULL,
		team_id INTEGER NOT NULL,
		account_id INTEGER NOT NULL,
		FOREIGN KEY (game_id) REFERENCES games(id),
		FOREIGN KEY (team_id) REFERENCES teams(id),
		FOREIGN KEY (account_id) REFERENCES accounts(id)
	);`

	// Create move_usage table to track move usage statistics
	createMoveUsageTable := `
	CREATE TABLE IF NOT EXISTS move_usage (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		game_id INTEGER NOT NULL,
		account_id INTEGER NOT NULL,
		pokemon_name TEXT NOT NULL,
		move_name TEXT NOT NULL,
		usage_count INTEGER DEFAULT 1,
		FOREIGN KEY (game_id) REFERENCES games(id),
		FOREIGN KEY (account_id) REFERENCES accounts(id)
	);`

	// Add team_id column to game_players table
	addTeamIdColumn := `
	ALTER TABLE game_players ADD COLUMN team_id INTEGER;
	`

	// Create indexes for better query performance
	createIndexes := `
	CREATE INDEX IF NOT EXISTS idx_team_usage_game_id ON team_usage(game_id);
	CREATE INDEX IF NOT EXISTS idx_team_usage_team_id ON team_usage(team_id);
	CREATE INDEX IF NOT EXISTS idx_team_usage_account_id ON team_usage(account_id);
	CREATE INDEX IF NOT EXISTS idx_move_usage_game_id ON move_usage(game_id);
	CREATE INDEX IF NOT EXISTS idx_move_usage_account_id ON move_usage(account_id);
	CREATE INDEX IF NOT EXISTS idx_move_usage_pokemon ON move_usage(pokemon_name);
	CREATE INDEX IF NOT EXISTS idx_teams_account_id ON teams(account_id);
	`

	// Execute migrations
	migrations := []string{
		createAccountsTable,
		createTeamsTable,
		createTeamUsageTable,
		createMoveUsageTable,
		addTeamIdColumn,
		createIndexes,
	}

	for _, migration := range migrations {
		_, err = db.Exec(migration)
		if err != nil {
			// Ignore errors for ALTER TABLE if column already exists
			if !strings.Contains(err.Error(), "duplicate column name") {
				log.Printf("Migration failed: %v\n", err)
			}
		} else {
			fmt.Println("Migration executed successfully")
		}
	}

	fmt.Println("Database migration completed successfully.")
}
