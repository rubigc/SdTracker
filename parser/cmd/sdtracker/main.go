package main

import (
	"SdTracker/pkg/databasepopulate"
	"SdTracker/pkg/downloadreplay"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// RequestData represents the JSON sent to /receive-logs
type RequestData struct {
	URL string `json:"url"`
}

var (
	username string

	// Mutex + Map um doppelte URLs zu verhindern
	URLs   = make(map[string]bool)
	URLsMu sync.Mutex
)

// parseDownload reads the replay file and sends it to the database
func parseDownload(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	replay := string(data)
	databasepopulate.AddReplay(replay, username)
}

// handlePost handles POST requests with a replay URL
func handlePost(w http.ResponseWriter, r *http.Request) {
	var data RequestData

	// Only allow POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Decode JSON
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Mark as seen and prevent overwrite of false and check for actual battle link
	if strings.Contains(data.URL, "battle") {
		URLsMu.Lock()
		if _, exists := URLs[data.URL]; !exists {
			URLs[data.URL] = false
		}
		URLsMu.Unlock()
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("URL received"))
}

// enableCORS is a middleware to allow CORS requests
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow requests from any origin (or set a specific origin)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func processReplay(url string) int {
	filePath := downloadreplay.Download(url)
	if filePath != "" {
		URLsMu.Lock()
		URLs[url] = true
		URLsMu.Unlock()
	} else {
		return 1
	}
	parseDownload(filePath)
	return 0
}

func main() {
	username = os.Getenv("SHOWDOWN_USERNAME")
	if username == "" {
		log.Fatal("SHOWDOWN_USERNAME environment variable not set")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/receive-logs", handlePost)

	//Loop to periodically check if replays are downloadable and downloads all the replays that are
	go func() {
		for {
			var routineUrls []string
			time.Sleep(5 * time.Minute)

			URLsMu.Lock()
			for url := range URLs {
				if !URLs[url] {
					routineUrls = append(routineUrls, url)
				}
			}
			URLsMu.Unlock()

			for _, url := range routineUrls {
				check := downloadreplay.CheckIfBattleFinished(url)
				if check {
					processReplay(url)
				}
			}
		}
	}()

	log.Printf("Server running on http://localhost:8098 for user %s", username)
	log.Fatal(http.ListenAndServe(":8098", enableCORS(mux)))
}
