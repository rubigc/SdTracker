package databasepopulate

import (
	"SdTracker/pkg/parsereplay"
	"database/sql"
	"log"
	"strings"
	_ "github.com/mattn/go-sqlite3"
)

func addMatch(replay string, db *sql.DB) {
	//General Setup (Match Info)
	matchUUID := parsereplay.GetMatchUUID(replay)
	player1 := parsereplay.GetPlayerNameById(replay, 1)
	player2 := parsereplay.GetPlayerNameById(replay, 2)

	//database stuff
	stmt, _ := db.Prepare(`INSERT OR IGNORE INTO matches(match_uuid, player1, player2, match_date) VALUES (?, ?, ?, datetime('now'))`)
	defer stmt.Close()

	stmt.Exec(matchUUID, player1, player2)
}

func setWinner(db *sql.DB, winnerId int, matchUUID string, replay string) {
	//Check match exists
	var matchId int
	err := db.QueryRow("SELECT id FROM matches WHERE match_uuid = ?", matchUUID).Scan(&matchId)
	if err != nil {
		addMatch(replay, db)
		return
	}
	stmt, _ := db.Prepare(`UPDATE matches SET winner = ? WHERE id = ?`)
	defer stmt.Close()

	stmt.Exec(winnerId, matchId)
}

func AddReplay(replay string, username string) {
	//Setup
	matchUUID := parsereplay.GetMatchUUID(replay)

	//Database
	db, err := sql.Open("sqlite3", "../pokemon_stats.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	//Match creation 
	gameNumber := parsereplay.GetGameNumber(replay)
	if gameNumber == 1 {
		addMatch(replay, db)
	} 
	
	//Set winner regardless so 1 game bo3s dont bug the bo3 winrate
	setWinner(db, parsereplay.GetWhoWonId(replay), matchUUID, replay)

	//Get match Id
	var matchId int
	db.QueryRow("SELECT id FROM matches WHERE match_uuid = ?", matchUUID).Scan(&matchId)
	
	//Game Info setter
	stmt, _ := db.Prepare(`INSERT OR IGNORE INTO games(match_id, game_number, match_uuid, winner, replay) VALUES (?, ?, ?, ?, ?)`)
	defer stmt.Close()
	stmt.Exec(matchId, gameNumber, matchUUID, parsereplay.GetPlayerNameById(replay, parsereplay.GetWhoWonId(replay)), replay)

	//Get game id
	var gameId int
	db.QueryRow("SELECT id FROM games WHERE match_uuid = ? AND game_number = ?", matchUUID, gameNumber).Scan(&gameId)

	//Player 1 Info set
	stmt, _ = db.Prepare(`INSERT OR IGNORE INTO game_players(game_id, player_name, team_pokemon, lead_pokemon, tera_used, ots) VALUES (?, ?, ?, ?, ?, ?)`)
	defer stmt.Close()
	stmt.Exec(gameId, parsereplay.GetPlayerNameById(replay, 1), strings.Join(parsereplay.GetAllPlayedPokemonFromPlayerId(replay, 1), ";"), strings.Join(parsereplay.GetLeadFromPlayerId(replay, 1), ";"), parsereplay.GetTera(replay, 1), parsereplay.GetOts(replay, 1))


	//Player 2 Info set
	stmt, _ = db.Prepare(`INSERT OR IGNORE INTO game_players(game_id, player_name, team_pokemon, lead_pokemon, tera_used, ots) VALUES (?, ?, ?, ?, ?, ?)`)
	defer stmt.Close()
	stmt.Exec(gameId, parsereplay.GetPlayerNameById(replay, 2), strings.Join(parsereplay.GetAllPlayedPokemonFromPlayerId(replay, 2), ";"), strings.Join(parsereplay.GetLeadFromPlayerId(replay, 2), ";"), parsereplay.GetTera(replay, 2), parsereplay.GetOts(replay, 2))
}
