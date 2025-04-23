package app

import (
	"os"
	"time"
	
	"SdTracker/backend/pkg/downloadreplay"
	"SdTracker/backend/pkg/parsereplay"
)

type App struct {
	matches []MatchHistory
}

type Player struct{
	Name string
	OTS string
	IsWinner bool
}

type MatchHistory struct {
	Timestamp  string
	Player1    Player
	Player2    Player
	ReplayFile string
}

func NewApp() *App {
	return &App{}
}

// Wails-exposed method
func (a *App) DownloadAndParse(url string) string {
	// Use your original download function
	path := downloadreplay.Download(url)
	
	// Read replay file
	content, _ := os.ReadFile(path)
	
	// Use your original parse functions
	player1 := Player{
		Name:     parsereplay.GetPlayerNameById(string(content), 1),
		OTS:  parsereplay.GetOts(string(content), 1),
		IsWinner: parsereplay.WhoWon(string(content)) == 1,
	}
	
	player2 := Player{
		Name:     parsereplay.GetPlayerNameById(string(content), 2),
		OTS:  parsereplay.GetOts(string(content), 2),
		IsWinner: parsereplay.WhoWon(string(content)) == 2,
	}

	// Store match
	a.matches = append(a.matches, MatchHistory{
		Timestamp:  time.Now().Format(time.RFC3339),
		Player1:    player1,
		Player2:    player2,
		ReplayFile: path,
	})
	
	return "Success"
}

// Other Wails-exposed methods
func (a *App) GetMatches() []MatchHistory {
	return a.matches
}

func (a *App) OpenReplay(path string) string {
	// Your existing open logic
	return "Opened: " + path
}