package api

import (
	"database/sql"
	"github.com/gofiber/fiber/v2"
	"backend/pkg/service"
)

func Winrates(conn *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		player := c.Params("name")
		data, err := service.GetWinrates(conn, player)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(data)
	}
}

func LeadStats(conn *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		player := c.Params("name")
		data, err := service.GetLeadStats(conn, player)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(data)
	}
}

func TeraStats(conn *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		player := c.Params("name")
		data, err := service.GetTeraStats(conn, player)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(data)
	}
}

func History(conn *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		player := c.Params("name")
		data, err := service.GetHistoryGames(conn, player)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(data)
	}
}
