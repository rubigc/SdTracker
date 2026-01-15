package main

import (
	"backend/pkg/api"
	"backend/pkg/db"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Connect to database
	conn, err := db.Connect()
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	// Initialize database schema
	if err := db.InitSchema(); err != nil {
		log.Fatal(err)
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	// Setup API routes
	api.SetupRoutes(app, conn)

	// Root endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "SdTracker API",
			"version": "1.0.0",
			"endpoints": fiber.Map{
				"health":   "/api/health",
				"winrates": "/api/winrates/:name",
				"leads":    "/api/leads/:name",
				"tera":     "/api/tera/:name",
				"history":  "/api/history/:name",
			},
		})
	})

	log.Println("Server running on http://localhost:3001")
	if err := app.Listen(":3001"); err != nil {
		log.Fatal(err)
	}
}
