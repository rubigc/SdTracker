package databasepopulate

import (
	"SdTracker/pkg/parsereplay"
	"database/sql"
	"log"
	"os"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

// initDB initializes the database tables if they don't exist
func initDB(db *sql.DB) error {
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

	_, err := db.Exec(createTables)
	if err != nil {
		return err
	}
	return nil
}

func addMatch(replay string, db *sql.DB) error {
	//General Setup (Match Info)
	matchUUID := parsereplay.GetMatchUUID(replay)
	player1 := parsereplay.GetPlayerNameById(replay, 1)
	player2 := parsereplay.GetPlayerNameById(replay, 2)

	//database stuff
	stmt, err := db.Prepare(`INSERT OR IGNORE INTO matches(match_uuid, player1, player2, match_date) VALUES (?, ?, ?, datetime('now'))`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(matchUUID, player1, player2)
	return err
}

func setWinner(db *sql.DB, winnerId int, matchUUID string, replay string) error {
	//Check match exists
	var matchId int
	err := db.QueryRow("SELECT id FROM matches WHERE match_uuid = ?", matchUUID).Scan(&matchId)
	if err != nil {
		// Match doesn't exist, create it first
		if err := addMatch(replay, db); err != nil {
			return err
		}
		// Try to get the match ID again
		err = db.QueryRow("SELECT id FROM matches WHERE match_uuid = ?", matchUUID).Scan(&matchId)
		if err != nil {
			return err
		}
	}
	stmt, err := db.Prepare(`UPDATE matches SET winner = ? WHERE id = ?`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(winnerId, matchId)
	return err
}

func AddReplay(replay string, username string) error {
	//Setup
	matchUUID := parsereplay.GetMatchUUID(replay)

	//Database - use environment variable or default to project root
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./pokemon_stats.db"
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return err
	}
	defer db.Close()

	// Initialize database tables if they don't exist
	if err := initDB(db); err != nil {
		log.Printf("Warning: Failed to initialize database tables: %v", err)
		// Continue anyway as tables might already exist
	}

	//Match creation
	gameNumber := parsereplay.GetGameNumber(replay)
	if gameNumber == 1 {
		if err := addMatch(replay, db); err != nil {
			return err
		}
	}

	//Set winner regardless so 1 game bo3s dont bug the bo3 winrate
	if err := setWinner(db, parsereplay.GetWhoWonId(replay), matchUUID, replay); err != nil {
		return err
	}

	//Get match Id
	var matchId int
	err = db.QueryRow("SELECT id FROM matches WHERE match_uuid = ?", matchUUID).Scan(&matchId)
	if err != nil {
		return err
	}

	//Game Info setter
	stmt, err := db.Prepare(`INSERT OR IGNORE INTO games(match_id, game_number, match_uuid, winner, replay) VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(matchId, gameNumber, matchUUID, parsereplay.GetPlayerNameById(replay, parsereplay.GetWhoWonId(replay)), replay)
	if err != nil {
		return err
	}

	//Get game id
	var gameId int
	err = db.QueryRow("SELECT id FROM games WHERE match_uuid = ? AND game_number = ?", matchUUID, gameNumber).Scan(&gameId)
	if err != nil {
		return err
	}

	//Player 1 Info set
	stmt, err = db.Prepare(`INSERT OR IGNORE INTO game_players(game_id, player_name, team_pokemon, lead_pokemon, tera_used, ots) VALUES (?, ?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(gameId, parsereplay.GetPlayerNameById(replay, 1), strings.Join(parsereplay.GetAllPlayedPokemonFromPlayerId(replay, 1), ";"), strings.Join(parsereplay.GetLeadFromPlayerId(replay, 1), ";"), parsereplay.GetTera(replay, 1), parsereplay.GetOts(replay, 1))
	if err != nil {
		return err
	}

	//Player 2 Info set
	stmt, err = db.Prepare(`INSERT OR IGNORE INTO game_players(game_id, player_name, team_pokemon, lead_pokemon, tera_used, ots) VALUES (?, ?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(gameId, parsereplay.GetPlayerNameById(replay, 2), strings.Join(parsereplay.GetAllPlayedPokemonFromPlayerId(replay, 2), ";"), strings.Join(parsereplay.GetLeadFromPlayerId(replay, 2), ";"), parsereplay.GetTera(replay, 2), parsereplay.GetOts(replay, 2))
	return err
}
