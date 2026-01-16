use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use std::env;
use super::models::*;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        // Get database path from environment or use default
        let db_path = env::var("DB_PATH")
            .unwrap_or_else(|_| "./pokemon_stats.db".to_string());

        // Ensure the directory exists
        if let Some(parent) = PathBuf::from(&db_path).parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;
        
        // Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON", [])?;
        
        // Set busy timeout
        conn.busy_timeout(std::time::Duration::from_secs(5))?;

        Ok(Database { conn })
    }

    pub fn get_overall_winrate(&self, player_name: &str) -> Result<WinrateResult> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT 
              (SELECT COUNT(*) FROM games
               JOIN game_players gp ON games.id = gp.game_id
               WHERE gp.player_name = ?1 AND games.winner = gp.player_name) AS wins,
              (SELECT COUNT(*) FROM game_players WHERE player_name = ?2) AS total"
        )?;

        let result = stmt.query_row(params![player_name, player_name], |row| {
            Ok(WinrateResult {
                wins: row.get(0)?,
                total: row.get(1)?,
            })
        })?;

        Ok(result)
    }

    pub fn get_bo3_winrate(&self, player_name: &str) -> Result<Bo3WinrateResult> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT 
              SUM(CASE WHEN m.winner = p_index THEN 1 ELSE 0 END) AS wins,
              COUNT(*) AS total
            FROM (
              SELECT m.id, m.winner, CASE WHEN m.player1 = ?1 THEN 1 ELSE 2 END AS p_index
              FROM matches m
              WHERE m.player1 = ?2 OR m.player2 = ?3
            ) AS m"
        )?;

        let result = stmt.query_row(params![player_name, player_name, player_name], |row| {
            Ok(Bo3WinrateResult {
                wins: row.get(0)?,
                total: row.get(1)?,
            })
        })?;

        Ok(result)
    }

    pub fn get_bo3_game_winrates(&self, player_name: &str) -> Result<Vec<Bo3GameWinrateResult>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT 
              game_number,
              COUNT(*) AS total,
              SUM(CASE WHEN winner = ?1 THEN 1 ELSE 0 END) AS wins
            FROM games
            WHERE match_id IN (
              SELECT id FROM matches 
              WHERE player1 = ?2 OR player2 = ?3
            )
            GROUP BY game_number
            ORDER BY game_number"
        )?;

        let results = stmt.query_map(params![player_name, player_name, player_name], |row| {
            Ok(Bo3GameWinrateResult {
                game_number: row.get(0)?,
                total: row.get(1)?,
                wins: row.get(2)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(results)
    }

    pub fn get_lead_stats(&self, player_name: &str) -> Result<Vec<StatResult>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT 
              lead_pokemon AS pokemon,
              COUNT(*) AS total,
              SUM(CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END) AS wins
            FROM game_players gp
            JOIN games g ON gp.game_id = g.id
            WHERE gp.player_name = ?1
              AND lead_pokemon IS NOT NULL
              AND lead_pokemon != ''
            GROUP BY lead_pokemon"
        )?;

        let results = stmt.query_map(params![player_name], |row| {
            Ok(StatResult {
                pokemon: row.get(0)?,
                tera_type: None,
                total: row.get(1)?,
                wins: row.get(2)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(results)
    }

    pub fn get_tera_stats(&self, player_name: &str) -> Result<Vec<StatResult>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT tera_used AS tera_type, COUNT(*) AS total,
              SUM(CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END) AS wins
            FROM game_players gp
            JOIN games g ON gp.game_id = g.id
            WHERE gp.player_name = ?1 AND tera_used IS NOT NULL AND tera_used != ''
            GROUP BY tera_used"
        )?;

        let results = stmt.query_map(params![player_name], |row| {
            Ok(StatResult {
                pokemon: None,
                tera_type: row.get(0)?,
                total: row.get(1)?,
                wins: row.get(2)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(results)
    }

    pub fn get_history(&self, player_name: &str) -> Result<Vec<HistoryResult>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT g.id AS game_id, g.game_number, g.winner,
                   gp.team_pokemon AS player_team, gp.lead_pokemon AS player_lead, gp.tera_used AS player_tera,
                   opp.player_name AS opponent, opp.team_pokemon AS opponent_team, opp.lead_pokemon AS opponent_lead, opp.tera_used AS opponent_tera
             FROM games g
             JOIN matches m ON g.match_id = m.id
             JOIN game_players gp ON g.id = gp.game_id AND gp.player_name = ?1
             JOIN game_players opp ON g.id = opp.game_id AND opp.player_name != ?2
             ORDER BY g.id DESC
             LIMIT 100"
        )?;

        let results = stmt.query_map(params![player_name, player_name], |row| {
            Ok(HistoryResult {
                game_id: row.get(0)?,
                game_number: row.get(1)?,
                winner: row.get(2)?,
                player_team: row.get(3)?,
                player_lead: row.get(4)?,
                player_tera: row.get(5)?,
                opponent: row.get(6)?,
                opponent_team: row.get(7)?,
                opponent_lead: row.get(8)?,
                opponent_tera: row.get(9)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(results)
    }
}
