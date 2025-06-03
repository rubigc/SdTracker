package main

import (
	"SdTracker/pkg/databasepopulate"
	"database/sql"
	"fmt"
	"os"
	"strconv"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, _ := sql.Open("sqlite3", "./pokemon_stats.db")
	defer db.Close()

	for x := range 3 {
		x = x + 1
		data, _ := os.ReadFile("./testdata/replay" + strconv.Itoa(x) + ".html")
		replay := string(data)
		databasepopulate.AddReplay(replay, "rubigc")
		fmt.Println("Parsed replay Nr." + strconv.Itoa(x))
	}

	fmt.Println("Done")

}
