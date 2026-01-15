package api

import (
	"database/sql"
	"fmt"
	"log"
	"sort"

	"github.com/gofiber/fiber/v2"
)

// SetupRoutes configures all API routes
func SetupRoutes(app *fiber.App, db *sql.DB) {
	api := app.Group("/api")

	// Health check endpoint
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "API is running",
		})
	})

	// Winrates endpoint
	api.Get("/winrates/:name", func(c *fiber.Ctx) error {
		return getWinrates(c, db)
	})

	// Leads endpoint
	api.Get("/leads/:name", func(c *fiber.Ctx) error {
		return getLeadStats(c, db)
	})

	// Tera endpoint
	api.Get("/tera/:name", func(c *fiber.Ctx) error {
		return getTeraStats(c, db)
	})

	// History endpoint
	api.Get("/history/:name", func(c *fiber.Ctx) error {
		return getHistory(c, db)
	})
}

// WinrateStats represents the winrate statistics response
type WinrateStats struct {
	OverallWinRate  float64           `json:"overall_win_rate"`
	GamesPlayed     int               `json:"games_played"`
	Bo3WinRate      float64           `json:"bo3_win_rate"`
	Bo3Played       int               `json:"bo3_played"`
	Bo3GameWinrates map[string]GameWR `json:"bo3_game_winrates"`
}

// GameWR represents winrate for a specific game in a Bo3
type GameWR struct {
	WinRate     float64 `json:"win_rate"`
	GamesPlayed int     `json:"games_played"`
}

// getWinrates returns winrate statistics for a player
func getWinrates(c *fiber.Ctx, db *sql.DB) error {
	playerName := c.Params("name")
	if playerName == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Player name is required",
		})
	}

	// Get all games for the player
	rows, err := db.Query(`
		SELECT game_number, winner, player_name
		FROM games
		WHERE player_name = ? OR opponent_name = ?
		ORDER BY game_number
	`, playerName, playerName)
	if err != nil {
		log.Printf("Error querying games: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to query games",
		})
	}
	defer rows.Close()

	type Game struct {
		GameNumber int
		Winner     string
		PlayerName string
	}

	games := []Game{}
	for rows.Next() {
		var g Game
		if err := rows.Scan(&g.GameNumber, &g.Winner, &g.PlayerName); err != nil {
			log.Printf("Error scanning game: %v", err)
			continue
		}
		games = append(games, g)
	}

	if len(games) == 0 {
		return c.JSON(WinrateStats{
			OverallWinRate:  0,
			GamesPlayed:     0,
			Bo3WinRate:      0,
			Bo3Played:       0,
			Bo3GameWinrates: map[string]GameWR{},
		})
	}

	// Calculate overall winrate
	wins := 0
	for _, g := range games {
		if g.Winner == playerName {
			wins++
		}
	}
	overallWinRate := float64(wins) / float64(len(games)) * 100

	// Group games by Bo3 (assuming games 1-3 are Bo3, 4-6 are next Bo3, etc.)
	bo3Groups := make(map[int][]Game)
	for _, g := range games {
		bo3Num := (g.GameNumber - 1) / 3
		bo3Groups[bo3Num] = append(bo3Groups[bo3Num], g)
	}

	// Calculate Bo3 winrate
	bo3Wins := 0
	bo3GameWinrates := make(map[string]GameWR)

	for _, bo3Games := range bo3Groups {
		bo3WinsCount := 0
		for _, g := range bo3Games {
			if g.Winner == playerName {
				bo3WinsCount++
			}
		}

		// Bo3 is won if player wins 2 or more games
		if bo3WinsCount >= 2 {
			bo3Wins++
		}

		// Calculate winrate for each game position in Bo3
		for _, g := range bo3Games {
			gamePos := (g.GameNumber - 1) % 3
			gameKey := fmt.Sprintf("Game %d", gamePos+1)

			if _, exists := bo3GameWinrates[gameKey]; !exists {
				bo3GameWinrates[gameKey] = GameWR{
					WinRate:     0,
					GamesPlayed: 0,
				}
			}

			stats := bo3GameWinrates[gameKey]
			stats.GamesPlayed++
			if g.Winner == playerName {
				stats.WinRate = (stats.WinRate*float64(stats.GamesPlayed-1) + 100) / float64(stats.GamesPlayed)
			} else {
				stats.WinRate = (stats.WinRate * float64(stats.GamesPlayed-1)) / float64(stats.GamesPlayed)
			}
			bo3GameWinrates[gameKey] = stats
		}
	}

	bo3WinRate := 0.0
	if len(bo3Groups) > 0 {
		bo3WinRate = float64(bo3Wins) / float64(len(bo3Groups)) * 100
	}

	return c.JSON(WinrateStats{
		OverallWinRate:  overallWinRate,
		GamesPlayed:     len(games),
		Bo3WinRate:      bo3WinRate,
		Bo3Played:       len(bo3Groups),
		Bo3GameWinrates: bo3GameWinrates,
	})
}

// LeadStat represents lead Pokemon statistics
type LeadStat struct {
	Pokemon     string  `json:"pokemon"`
	WinRate     float64 `json:"win_rate"`
	GamesPlayed int     `json:"games_played"`
}

// getLeadStats returns lead Pokemon statistics for a player
func getLeadStats(c *fiber.Ctx, db *sql.DB) error {
	playerName := c.Params("name")
	if playerName == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Player name is required",
		})
	}

	rows, err := db.Query(`
		SELECT player_lead, winner
		FROM games
		WHERE player_name = ?
		ORDER BY player_lead
	`, playerName)
	if err != nil {
		log.Printf("Error querying lead stats: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to query lead stats",
		})
	}
	defer rows.Close()

	leadStats := make(map[string]LeadStat)
	for rows.Next() {
		var lead, winner string
		if err := rows.Scan(&lead, &winner); err != nil {
			log.Printf("Error scanning lead stat: %v", err)
			continue
		}

		if _, exists := leadStats[lead]; !exists {
			leadStats[lead] = LeadStat{
				Pokemon:     lead,
				WinRate:     0,
				GamesPlayed: 0,
			}
		}

		stats := leadStats[lead]
		stats.GamesPlayed++
		if winner == playerName {
			stats.WinRate = (stats.WinRate*float64(stats.GamesPlayed-1) + 100) / float64(stats.GamesPlayed)
		} else {
			stats.WinRate = (stats.WinRate * float64(stats.GamesPlayed-1)) / float64(stats.GamesPlayed)
		}
		leadStats[lead] = stats
	}

	// Convert map to slice and sort by games played
	result := make([]LeadStat, 0, len(leadStats))
	for _, stat := range leadStats {
		result = append(result, stat)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].GamesPlayed > result[j].GamesPlayed
	})

	return c.JSON(result)
}

// TeraStat represents Terastallization type statistics
type TeraStat struct {
	TeraType    string  `json:"tera_type"`
	WinRate     float64 `json:"win_rate"`
	GamesPlayed int     `json:"games_played"`
}

// getTeraStats returns Terastallization type statistics for a player
func getTeraStats(c *fiber.Ctx, db *sql.DB) error {
	playerName := c.Params("name")
	if playerName == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Player name is required",
		})
	}

	rows, err := db.Query(`
		SELECT player_tera, winner
		FROM games
		WHERE player_name = ?
		ORDER BY player_tera
	`, playerName)
	if err != nil {
		log.Printf("Error querying tera stats: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to query tera stats",
		})
	}
	defer rows.Close()

	teraStats := make(map[string]TeraStat)
	for rows.Next() {
		var tera, winner string
		if err := rows.Scan(&tera, &winner); err != nil {
			log.Printf("Error scanning tera stat: %v", err)
			continue
		}

		if _, exists := teraStats[tera]; !exists {
			teraStats[tera] = TeraStat{
				TeraType:    tera,
				WinRate:     0,
				GamesPlayed: 0,
			}
		}

		stats := teraStats[tera]
		stats.GamesPlayed++
		if winner == playerName {
			stats.WinRate = (stats.WinRate*float64(stats.GamesPlayed-1) + 100) / float64(stats.GamesPlayed)
		} else {
			stats.WinRate = (stats.WinRate * float64(stats.GamesPlayed-1)) / float64(stats.GamesPlayed)
		}
		teraStats[tera] = stats
	}

	// Convert map to slice and sort by games played
	result := make([]TeraStat, 0, len(teraStats))
	for _, stat := range teraStats {
		result = append(result, stat)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].GamesPlayed > result[j].GamesPlayed
	})

	return c.JSON(result)
}

// Player represents a player in a game
type Player struct {
	Name string `json:"name"`
	Team string `json:"team"`
	Lead string `json:"lead"`
	Tera string `json:"tera"`
	Ots  string `json:"ots"`
}

// HistoryGame represents a game in the history
type HistoryGame struct {
	GameID     int    `json:"game_id"`
	GameNumber int    `json:"game_number"`
	Winner     string `json:"winner"`
	Player     Player `json:"player"`
	Opponent   Player `json:"opponent"`
}

// getHistory returns game history for a player
func getHistory(c *fiber.Ctx, db *sql.DB) error {
	playerName := c.Params("name")
	if playerName == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Player name is required",
		})
	}

	rows, err := db.Query(`
		SELECT id, game_number, winner,
		       player_name, player_team, player_lead, player_tera, player_ots,
		       opponent_name, opponent_team, opponent_lead, opponent_tera, opponent_ots
		FROM games
		WHERE player_name = ? OR opponent_name = ?
		ORDER BY game_number DESC
		LIMIT 100
	`, playerName, playerName)
	if err != nil {
		log.Printf("Error querying history: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to query history",
		})
	}
	defer rows.Close()

	games := []HistoryGame{}
	for rows.Next() {
		var g HistoryGame
		var player, opponent Player

		err := rows.Scan(
			&g.GameID, &g.GameNumber, &g.Winner,
			&player.Name, &player.Team, &player.Lead, &player.Tera, &player.Ots,
			&opponent.Name, &opponent.Team, &opponent.Lead, &opponent.Tera, &opponent.Ots,
		)
		if err != nil {
			log.Printf("Error scanning history game: %v", err)
			continue
		}

		// Ensure the player is always the queried player
		if player.Name != playerName {
			player, opponent = opponent, player
		}

		g.Player = player
		g.Opponent = opponent
		games = append(games, g)
	}

	return c.JSON(games)
}
