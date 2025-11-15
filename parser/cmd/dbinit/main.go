package main

import (
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	dbPath := filepath.Join(".", "pokemon_stats.db")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		log.Println("Initializing database...")
		// Run the initDb script
		if err := RunInitDB(); err != nil {
			log.Fatalf("Failed to initialize database: %v", err)
		}
	}
	log.Println("Database initialized successfully")
}

func RunInitDB() error {
	// First run initDb.go from gobackend directory
	cmd := exec.Command("go", "run", "./cmd/database/initDb.go")
	cmd.Dir = "gobackend"
	if err := cmd.Run(); err != nil {
		return err
	}
	
	// Copy the database file to project root if it doesn't exist
	dbPath := filepath.Join(".", "pokemon_stats.db")
	gobackendDbPath := filepath.Join("gobackend", "pokemon_stats.db")
	
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		// Copy database from gobackend to root
		data, err := os.ReadFile(gobackendDbPath)
		if err != nil {
			return err
		}
		return os.WriteFile(dbPath, data, 0644)
	}
	
	return nil
}