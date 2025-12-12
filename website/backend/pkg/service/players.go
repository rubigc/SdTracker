// ==================== /pkg/service/players.go ====================
package service

import (
	"database/sql"
	"backend/pkg/models"
	"backend/pkg/db"
)

func GetWinrates(conn *sql.DB, player string) (models.WinrateStats, error) {
	var wr models.WinrateStats

	// Overall WR
	var wins, total int
	err := conn.QueryRow(db.QueryOverallWR, player, player).Scan(&wins, &total)
	if err != nil {
		return wr, err
	}
	wr.Overall = float64(wins) / float64(total) * 100
	wr.GamesPlayed = total

	// BO3 WR
	err = conn.QueryRow(db.QueryBO3WR, player, player, player).Scan(&wins, &total)
	if err != nil {
		return wr, err
	}
	wr.BO3 = float64(wins) / float64(total) * 100
	wr.BO3Played = total

	// BO3 Games WR
	rows, err := conn.Query(db.QueryBO3GamesWR, player, player, player)
	if err != nil {
		return wr, err
	}
	defer rows.Close()

	wr.BO3Games = make(map[string]models.GameWR)
	for rows.Next() {
		var gameNumber, gtotal, gwins int
		rows.Scan(&gameNumber, &gtotal, &gwins)
		wr.BO3Games["g"+string(rune(gameNumber))] = models.GameWR{
			WinRate:     float64(gwins) / float64(gtotal) * 100,
			GamesPlayed: gtotal,
		}
	}

	return wr, nil
}

func GetLeadStats(conn *sql.DB, player string) ([]models.LeadStat, error) {
	rows, err := conn.Query(db.QueryLeadStats, player)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []models.LeadStat
	for rows.Next() {
		var pokemon string
		var total, wins int
		rows.Scan(&pokemon, &total, &wins)
		stats = append(stats, models.LeadStat{
			Pokemon:     pokemon,
			WinRate:     float64(wins) / float64(total) * 100,
			GamesPlayed: total,
		})
	}
	return stats, nil
}

func GetTeraStats(conn *sql.DB, player string) ([]models.TeraStat, error) {
	rows, err := conn.Query(db.QueryTeraStats, player)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []models.TeraStat
	for rows.Next() {
		var tera string
		var total, wins int
		rows.Scan(&tera, &total, &wins)
		stats = append(stats, models.TeraStat{
			TeraType:    tera,
			WinRate:     float64(wins) / float64(total) * 100,
			GamesPlayed: total,
		})
	}
	return stats, nil
}
