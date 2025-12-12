// ==================== /pkg/service/matches.go ====================
package service

import (
	"database/sql"
	"backend/pkg/models"
	"backend/pkg/db"
)

func GetHistoryGames(conn *sql.DB, player string) ([]models.HistoryGame, error) {
	rows, err := conn.Query(db.QueryHistoryGames, player, player)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var games []models.HistoryGame
	for rows.Next() {
		var g models.HistoryGame
		var playerName, playerTeam, playerLead, playerTera, playerOTS string
		var oppName, oppTeam, oppLead, oppTera string
		var gameID, gameNum int
		var winner string
		rows.Scan(&gameID, &gameNum, &winner, &playerName, &playerTeam, &playerLead, &playerTera, &playerOTS, &oppName, &oppTeam, &oppLead, &oppTera)

		g.GameID = gameID
		g.GameNum = gameNum
		g.Winner = winner
		g.Player = models.Player{
			Name: playerName, Team: playerTeam, Lead: playerLead, Tera: playerTera, OTS: playerOTS,
		}
		g.Opponent = models.Player{
			Name: oppName, Team: oppTeam, Lead: oppLead, Tera: oppTera,
		}
		games = append(games, g)
	}

	return games, nil
}
