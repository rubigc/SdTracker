package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "./pokemon_stats.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	createTables := `
	CREATE TABLE IF NOT EXISTS matches (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		match_uuid TEXT UNIQUE,
		player1 TEXT,
		player2 TEXT,
		winner INTEGER,
		match_date TEXT
	);

	CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		match_id INTEGER,
		game_number INTEGER,
		match_uuid TEXT,
		winner TEXT,
		replay TEXT,
		FOREIGN KEY (match_id) REFERENCES matches(id)
	);

	CREATE TABLE IF NOT EXISTS game_players (
		game_id INTEGER NOT NULL,
		player_name TEXT NOT NULL,
		team_pokemon TEXT,
		lead_pokemon TEXT,
		tera_used TEXT,
		ots TEXT,
		PRIMARY KEY (game_id, player_name),
		FOREIGN KEY (game_id) REFERENCES games(id)
	);
	`

	_, err = db.Exec(createTables)
	if err != nil {
		log.Fatalf("Failed to create tables: %v", err)
	}

	fmt.Println("Database initialized successfully.")
}
