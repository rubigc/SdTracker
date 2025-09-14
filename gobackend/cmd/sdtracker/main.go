package main

import (
	"SdTracker/pkg/databasepopulate"
	"SdTracker/pkg/downloadreplay"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
)

// RequestData represents the JSON sent to /receive-logs
type RequestData struct {
	URL string `json:"url"`
}

var (
	username string

	// Mutex + Map um doppelte URLs zu verhindern
	seenURLs   = make(map[string]bool)
	seenURLsMu sync.Mutex
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

	// --- Check & Mark URL ---
	seenURLsMu.Lock()
	if seenURLs[data.URL] {
		seenURLsMu.Unlock()
		log.Printf("[INFO] URL already processed: %s", data.URL)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("URL already processed"))
		return
	}
	// Mark as seen
	seenURLs[data.URL] = true
	seenURLsMu.Unlock()

	// Download replay and add to database
	filePath := downloadreplay.Download(data.URL)
	if filePath == "" {
		// Wenn Download failed → URL wieder freigeben
		seenURLsMu.Lock()
		delete(seenURLs, data.URL)
		seenURLsMu.Unlock()

		http.Error(w, "Failed to download replay", http.StatusInternalServerError)
		return
	}
	parseDownload(filePath)

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

func main() {
	username = os.Getenv("SHOWDOWN_USERNAME")
	if username == "" {
		log.Fatal("SHOWDOWN_USERNAME environment variable not set")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/receive-logs", handlePost)

	log.Printf("Server running on http://localhost:8098 for user %s", username)
	log.Fatal(http.ListenAndServe(":8098", enableCORS(mux)))
}