package databasepopulate

import (
	"SdTracker/pkg/parsereplay"
	"database/sql"
	_ "embed"
	"log"
	"os"
	"regexp"
	"sort"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed schema.sql
var schemaSQL string

// initDB initializes the database tables if they don't exist
func initDB(db *sql.DB) error {
	_, err := db.Exec(schemaSQL)
	if err != nil {
		return err
	}

	// Add team_id column if missing (ignore errors if it already exists)
	_, _ = db.Exec(`ALTER TABLE game_players ADD COLUMN team_id INTEGER`)

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

func AddReplay(replay string) error {
	//Setup
	matchUUID := parsereplay.GetMatchUUID(replay)
	gameNumber := parsereplay.GetGameNumber(replay)

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

	//Game Info setter (avoid duplicates if already imported)
	var gameId int
	var stmt *sql.Stmt
	err = db.QueryRow("SELECT id FROM games WHERE match_uuid = ? AND game_number = ?", matchUUID, gameNumber).Scan(&gameId)
	if err == sql.ErrNoRows {
		stmt, err = db.Prepare(`INSERT INTO games(match_id, game_number, match_uuid, winner, replay) VALUES (?, ?, ?, ?, ?)`)
		if err != nil {
			return err
		}
		defer stmt.Close()

		_, err = stmt.Exec(matchId, gameNumber, matchUUID, parsereplay.GetPlayerNameById(replay, parsereplay.GetWhoWonId(replay)), replay)
		if err != nil {
			return err
		}

		err = db.QueryRow("SELECT id FROM games WHERE match_uuid = ? AND game_number = ?", matchUUID, gameNumber).Scan(&gameId)
		if err != nil {
			return err
		}
	} else if err != nil {
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
	if err != nil {
		return err
	}

	// Record team usage and move usage if accounts/teams exist
	if err := recordAccountData(db, replay, gameId, 1); err != nil {
		log.Printf("Warning: failed recording account data for player 1: %v", err)
	}
	if err := recordAccountData(db, replay, gameId, 2); err != nil {
		log.Printf("Warning: failed recording account data for player 2: %v", err)
	}

	return nil
}

type parsedPokemon struct {
	species string
	item    string
	ability string
	tera    string
	moves   []string
}

func normalizeToken(input string) string {
	input = strings.ToLower(strings.TrimSpace(input))
	var b strings.Builder
	for _, r := range input {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		}
	}
	return b.String()
}

var parenRegex = regexp.MustCompile(`\(([^)]*)\)`)

func extractSpecies(header string) string {
	matches := parenRegex.FindAllStringSubmatch(header, -1)
	for _, match := range matches {
		if len(match) < 2 {
			continue
		}
		inside := strings.TrimSpace(match[1])
		if inside != "" && inside != "M" && inside != "F" {
			return inside
		}
	}

	cleaned := strings.ReplaceAll(header, "(M)", "")
	cleaned = strings.ReplaceAll(cleaned, "(F)", "")
	return strings.TrimSpace(cleaned)
}

func parseTeamData(teamData string) []parsedPokemon {
	lines := strings.Split(teamData, "\n")
	var team []parsedPokemon
	var current *parsedPokemon

	flush := func() {
		if current != nil && current.species != "" {
			team = append(team, *current)
		}
		current = nil
	}

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			flush()
			continue
		}

		if current == nil {
			current = &parsedPokemon{}
			headerParts := strings.SplitN(trimmed, " @ ", 2)
			header := strings.TrimSpace(headerParts[0])
			if len(headerParts) > 1 {
				current.item = strings.TrimSpace(headerParts[1])
			}
			current.species = extractSpecies(header)
			continue
		}

		switch {
		case strings.HasPrefix(trimmed, "Ability:"):
			current.ability = strings.TrimSpace(strings.TrimPrefix(trimmed, "Ability:"))
		case strings.HasPrefix(trimmed, "Tera Type:"):
			current.tera = strings.TrimSpace(strings.TrimPrefix(trimmed, "Tera Type:"))
		case strings.HasPrefix(trimmed, "-"):
			move := strings.TrimSpace(strings.TrimPrefix(trimmed, "-"))
			if move != "" {
				current.moves = append(current.moves, move)
			}
		}
	}

	flush()
	return team
}

func buildTeamKey(teamData string) string {
	team := parseTeamData(teamData)
	if len(team) == 0 {
		return ""
	}

	var members []string
	for _, pokemon := range team {
		if pokemon.species == "" {
			continue
		}
		moves := make([]string, 0, len(pokemon.moves))
		for _, move := range pokemon.moves {
			normalized := normalizeToken(move)
			if normalized != "" {
				moves = append(moves, normalized)
			}
		}
		sort.Strings(moves)
		memberKey := strings.Join([]string{
			normalizeToken(pokemon.species),
			normalizeToken(pokemon.item),
			normalizeToken(pokemon.ability),
			normalizeToken(pokemon.tera),
			strings.Join(moves, ","),
		}, "|")
		members = append(members, memberKey)
	}

	sort.Strings(members)
	return strings.Join(members, "||")
}

func getAccountIDByName(db *sql.DB, playerName string) (int, bool, error) {
	var accountID int
	err := db.QueryRow(`SELECT id FROM accounts WHERE LOWER(name) = LOWER(?)`, playerName).Scan(&accountID)
	if err == sql.ErrNoRows {
		return 0, false, nil
	}
	if err != nil {
		return 0, false, err
	}
	return accountID, true, nil
}

func getTeamsForAccount(db *sql.DB, accountID int) ([]int, []string, error) {
	rows, err := db.Query(`SELECT id, team_data FROM teams WHERE account_id = ? OR account_id IS NULL ORDER BY account_id DESC`, accountID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var ids []int
	var data []string
	for rows.Next() {
		var id int
		var teamData string
		if err := rows.Scan(&id, &teamData); err != nil {
			return nil, nil, err
		}
		ids = append(ids, id)
		data = append(data, teamData)
	}
	return ids, data, rows.Err()
}

func recordAccountData(db *sql.DB, replay string, gameId int, playerId int) error {
	playerName := parsereplay.GetPlayerNameById(replay, playerId)
	accountID, ok, err := getAccountIDByName(db, playerName)
	if err != nil || !ok {
		return err
	}

	ots := parsereplay.GetOts(replay, playerId)
	teamKey := buildTeamKey(ots)

	if teamKey != "" {
		teamID, matched, err := findMatchingTeamID(db, accountID, teamKey)
		if err != nil {
			return err
		}
		if matched {
			updated, err := recordTeamUsage(db, gameId, teamID, accountID)
			if err != nil {
				return err
			}
			if updated {
				won := parsereplay.GetWhoWonId(replay) == playerId
				if err := updateTeamStats(db, teamID, won); err != nil {
					return err
				}
			}
			_, _ = db.Exec(`UPDATE game_players SET team_id = ? WHERE game_id = ? AND player_name = ?`, teamID, gameId, playerName)
		}
	}

	if err := recordMoveUsage(db, replay, gameId, playerId, accountID); err != nil {
		return err
	}

	return nil
}

func findMatchingTeamID(db *sql.DB, accountID int, teamKey string) (int, bool, error) {
	ids, data, err := getTeamsForAccount(db, accountID)
	if err != nil {
		return 0, false, err
	}

	for idx, teamData := range data {
		if buildTeamKey(teamData) == teamKey {
			return ids[idx], true, nil
		}
	}
	return 0, false, nil
}

func recordTeamUsage(db *sql.DB, gameId int, teamId int, accountId int) (bool, error) {
	var exists int
	err := db.QueryRow(`SELECT 1 FROM team_usage WHERE game_id = ? AND account_id = ? LIMIT 1`, gameId, accountId).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	if exists == 1 {
		return false, nil
	}

	_, err = db.Exec(`INSERT INTO team_usage (game_id, team_id, account_id) VALUES (?, ?, ?)`, gameId, teamId, accountId)
	if err != nil {
		return false, err
	}
	return true, nil
}

func updateTeamStats(db *sql.DB, teamId int, won bool) error {
	_, err := db.Exec(
		`UPDATE teams SET games_played = games_played + 1, wins = wins + ?, last_used = CURRENT_TIMESTAMP WHERE id = ?`,
		boolToInt(won),
		teamId,
	)
	return err
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func recordMoveUsage(db *sql.DB, replay string, gameId int, playerId int, accountId int) error {
	var exists int
	err := db.QueryRow(`SELECT 1 FROM move_usage WHERE game_id = ? AND account_id = ? LIMIT 1`, gameId, accountId).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if exists == 1 {
		return nil
	}

	usages := parsereplay.GetMoveUsage(replay, playerId)
	for _, usage := range usages {
		var id int
		var count int
		err := db.QueryRow(
			`SELECT id, usage_count FROM move_usage WHERE game_id = ? AND account_id = ? AND pokemon_name = ? AND move_name = ?`,
			gameId,
			accountId,
			usage.PokemonName,
			usage.MoveName,
		).Scan(&id, &count)
		if err == sql.ErrNoRows {
			_, err = db.Exec(
				`INSERT INTO move_usage (game_id, account_id, pokemon_name, move_name, usage_count) VALUES (?, ?, ?, ?, 1)`,
				gameId,
				accountId,
				usage.PokemonName,
				usage.MoveName,
			)
			if err != nil {
				return err
			}
			continue
		}
		if err != nil {
			return err
		}
		_, err = db.Exec(
			`UPDATE move_usage SET usage_count = ? WHERE id = ?`,
			count+1,
			id,
		)
		if err != nil {
			return err
		}
	}

	return nil
}
