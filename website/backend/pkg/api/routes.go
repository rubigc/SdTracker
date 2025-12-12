// ==================== /pkg/api/routes.go ====================
package api

import (
	"database/sql"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, conn *sql.DB) {
	app.Get("/api/player/:name/winrates", Winrates(conn))
	app.Get("/api/player/:name/leadstats", LeadStats(conn))
	app.Get("/api/player/:name/terastats", TeraStats(conn))
	app.Get("/api/player/:name/history", History(conn))
}
