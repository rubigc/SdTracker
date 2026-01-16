use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use std::env;
use super::models::*;

pub struct Database {
    conn: Connection,
}

/// Get path to a resource file relative to the executable's resources directory
fn get_resource_path(resource_name: &str) -> PathBuf {
    // First check if DB_PATH environment variable is set
    if let Ok(db_path) = env::var("DB_PATH") {
        return PathBuf::from(db_path);
    }
    
    // Otherwise, resolve relative to executable's resources folder
    let mut path = std::env::current_exe()
        .expect("Failed to get executable path");
    path.pop(); // Remove executable name
    path.push("resources");
    path.push(resource_name);
    path
}

impl Database {
    pub fn new() -> Result<Self> {
        // Get database path from resources folder
        let db_path = get_resource_path("pokemon_stats.db");
        
        eprintln!("Opening database at: {:?}", db_path);

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
        // First, get all the raw lead data with wins
        let mut stmt = self.conn.prepare_cached(
            "SELECT
              lead_pokemon,
              CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END AS won
            FROM game_players gp
            JOIN games g ON gp.game_id = g.id
            WHERE gp.player_name = ?1
              AND lead_pokemon IS NOT NULL
              AND lead_pokemon != ''"
        )?;

        // Collect raw data
        let raw_data: Vec<(String, i64)> = stmt.query_map(params![player_name], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
        })?.collect::<Result<Vec<_>>>()?;

        // Split semicolon-separated Pokemon and aggregate stats
        let mut pokemon_stats: std::collections::HashMap<String, (i64, i64)> = std::collections::HashMap::new();
        
        for (lead_pokemon, won) in raw_data {
            // Split by semicolon to get individual Pokemon
            for pokemon in lead_pokemon.split(';') {
                let pokemon = pokemon.trim();
                if !pokemon.is_empty() {
                    let entry = pokemon_stats.entry(pokemon.to_string()).or_insert((0, 0));
                    entry.0 += 1; // total games
                    entry.1 += won; // wins
                }
            }
        }

        // Convert to StatResult
        let results: Vec<StatResult> = pokemon_stats
            .into_iter()
            .map(|(pokemon, (total, wins))| StatResult {
                pokemon: Some(pokemon),
                tera_type: None,
                total,
                wins,
            })
            .collect();

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
