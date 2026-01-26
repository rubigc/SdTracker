package main

import (
	"SdTracker/pkg/databasepopulate"
	"SdTracker/pkg/downloadreplay"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

// RequestData represents the JSON sent to /receive-logs
type RequestData struct {
	URL string `json:"url"`
}

// PasteData represents the JSON sent to /paste-replay
type PasteData struct {
	HTML string `json:"html"`
}

// parseDownload reads the replay file and sends it to the database
func parseDownload(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	replay := string(data)
	return databasepopulate.AddReplay(replay)
}

// parseHTML parses HTML content directly and sends it to the database
func parseHTML(htmlContent string) error {
	return databasepopulate.AddReplay(htmlContent)
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

	// Download replay and add to database
	filePath := downloadreplay.Download(data.URL)
	if filePath == "" {
		http.Error(w, "Failed to download replay", http.StatusInternalServerError)
		return
	}
	if err := parseDownload(filePath); err != nil {
		log.Printf("Error parsing replay: %v", err)
		http.Error(w, "Failed to parse replay", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("URL received"))
}

// handlePaste handles POST requests with pasted HTML content
func handlePaste(w http.ResponseWriter, r *http.Request) {
	// Only allow POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var data PasteData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate HTML content
	if strings.TrimSpace(data.HTML) == "" {
		http.Error(w, "HTML content cannot be empty", http.StatusBadRequest)
		return
	}

	// Parse HTML and add to database
	if err := parseHTML(data.HTML); err != nil {
		log.Printf("Error parsing HTML: %v", err)
		http.Error(w, "Failed to parse HTML", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("HTML received"))
}

// handleUpload handles file upload of HTML replay files
func handleUpload(w http.ResponseWriter, r *http.Request) {
	// Only allow POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form (max 10MB)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// Get the file from form
	file, handler, err := r.FormFile("replay")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file type
	if !strings.HasSuffix(strings.ToLower(handler.Filename), ".html") {
		http.Error(w, "Only HTML files are allowed", http.StatusBadRequest)
		return
	}

	// Read file content
	content, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	// Parse HTML and add to database
	if err := parseHTML(string(content)); err != nil {
		log.Printf("Error parsing uploaded file: %v", err)
		http.Error(w, "Failed to parse file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("File uploaded successfully"))
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
	mux := http.NewServeMux()
	mux.HandleFunc("/receive-logs", handlePost)
	mux.HandleFunc("/paste-replay", handlePaste)
	mux.HandleFunc("/upload-replay", handleUpload)

	log.Printf("Server running on http://localhost:8098")
	log.Println("Available endpoints:")
	log.Println("  POST /receive-logs - Download replay from URL")
	log.Println("  POST /paste-replay - Paste HTML content directly")
	log.Println("  POST /upload-replay - Upload HTML file")
	log.Fatal(http.ListenAndServe(":8098", enableCORS(mux)))
}
