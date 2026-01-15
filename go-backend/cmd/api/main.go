package main

import (
	"github.com/gofiber/fiber/v2"
	"backend/pkg/db"
	"backend/pkg/api"
	"log"
)

func main() {
	conn, err := db.Connect()
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	app := fiber.New()

	api.SetupRoutes(app, conn)

	log.Println("Server running on http://localhost:3001")
	app.Listen(":3001")
}
