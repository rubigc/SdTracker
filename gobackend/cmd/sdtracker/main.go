package main

import (
	"SdTracker/pkg/databasepopulate"
	"SdTracker/pkg/downloadreplay"
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type RequestData struct {
	URL string `json:"url"`
}

var username string

func parseDownload(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	replay := string(data)
	databasepopulate.AddReplay(replay, username)
}

func handlePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var data RequestData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	filePath := downloadreplay.Download(data.URL)
	parseDownload(filePath)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("URL received"))
}

func main() {
	username = os.Getenv("SHOWDOWN_USERNAME")
	if username == "" {
		log.Fatal("SHOWDOWN_USERNAME environment variable not set")
	}

	http.HandleFunc("/url", handlePost)
	log.Printf("Server running on http://localhost:8089 for user %s", username)
	log.Fatal(http.ListenAndServe(":8098", nil))
}
