package models

// WinrateStats holds all winrates for a player
type WinrateStats struct {
	Overall     float64            `json:"overall_win_rate"`
	GamesPlayed int                `json:"games_played"`
	BO3         float64            `json:"bo3_win_rate"`
	BO3Played   int                `json:"bo3_played"`
	BO3Games    map[string]GameWR  `json:"bo3_game_winrates"`
}

// GameWR holds winrate and games played per game in BO3
type GameWR struct {
	WinRate     float64 `json:"win_rate"`
	GamesPlayed int     `json:"games_played"`
}

// LeadStat holds winrate for leads
type LeadStat struct {
	Pokemon     string  `json:"pokemon"`
	WinRate     float64 `json:"win_rate"`
	GamesPlayed int     `json:"games_played"`
}

// PokemonStat holds winrate per pokemon
type PokemonStat struct {
	Pokemon     string  `json:"pokemon"`
	WinRate     float64 `json:"win_rate"`
	GamesPlayed int     `json:"games_played"`
}

// TeraStat holds winrate per tera type
type TeraStat struct {
	TeraType    string  `json:"tera_type"`
	WinRate     float64 `json:"win_rate"`
	GamesPlayed int     `json:"games_played"`
}

// HistoryGame holds game history data
type HistoryGame struct {
	GameID   int    `json:"game_id"`
	GameNum  int    `json:"game_number"`
	Winner   string `json:"winner"`
	Player   Player `json:"player"`
	Opponent Player `json:"opponent"`
}

// Player holds basic player info for history
type Player struct {
	Name      string `json:"name"`
	Team      string `json:"team"`
	Lead      string `json:"lead"`
	Tera      string `json:"tera"`
	OTS       string `json:"ots"`
}

// Summary holds all stats together
type Summary struct {
	Winrates   WinrateStats  `json:"winrates"`
	Leads      []LeadStat    `json:"leads"`
	Pokemon    []PokemonStat `json:"pokemon"`
	Tera       []TeraStat    `json:"tera"`
}
