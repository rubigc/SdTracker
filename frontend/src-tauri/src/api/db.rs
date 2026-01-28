use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use std::env;
use std::fs;
use super::models::*;

const SCHEMA_SQL: &str = include_str!("../../../../parser/pkg/databasepopulate/schema.sql");

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

        if let Some(parent) = db_path.parent() {
            if let Err(_err) = fs::create_dir_all(parent) {
                return Err(rusqlite::Error::InvalidPath(db_path.clone()));
            }
        }

        let conn = Connection::open(&db_path)?;
        
        // Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON", [])?;
        
        // Set busy timeout
        conn.busy_timeout(std::time::Duration::from_secs(5))?;

        // Ensure schema exists
        initialize_schema(&conn)?;

        Ok(Database { conn })
    }

    pub fn get_overall_winrate(&self, player_name: &str, account_id: i64, team_id: Option<i64>) -> Result<WinrateResult> {
        if let Some(team_id) = team_id {
            let mut stmt = self.conn.prepare_cached(
                "SELECT
                  SUM(CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END) AS wins,
                  COUNT(*) AS total
                 FROM team_usage tu
                 JOIN games g ON tu.game_id = g.id
                 JOIN game_players gp ON g.id = gp.game_id AND gp.player_name = ?1
                 WHERE tu.account_id = ?2 AND tu.team_id = ?3"
            )?;

            let result = stmt.query_row(params![player_name, account_id, team_id], |row| {
                Ok(WinrateResult {
                    wins: row.get(0)?,
                    total: row.get(1)?,
                })
            })?;

            return Ok(result);
        }

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

    pub fn get_bo3_winrate(&self, player_name: &str, account_id: i64, team_id: Option<i64>) -> Result<Bo3WinrateResult> {
        if let Some(team_id) = team_id {
            let mut stmt = self.conn.prepare_cached(
                "SELECT 
                  SUM(CASE WHEN match_winner = p_index THEN 1 ELSE 0 END) AS wins,
                  COUNT(*) AS total
                 FROM (
                   SELECT DISTINCT m.id, m.winner AS match_winner,
                          CASE WHEN m.player1 = ?1 THEN 1 ELSE 2 END AS p_index
                   FROM matches m
                   JOIN games g ON g.match_id = m.id
                   JOIN team_usage tu ON tu.game_id = g.id AND tu.team_id = ?2 AND tu.account_id = ?3
                   WHERE m.player1 = ?1 OR m.player2 = ?1
                 ) filtered"
            )?;

            let result = stmt.query_row(params![player_name, team_id, account_id], |row| {
                Ok(Bo3WinrateResult {
                    wins: row.get(0)?,
                    total: row.get(1)?,
                })
            })?;

            return Ok(result);
        }

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

    pub fn get_bo3_game_winrates(&self, player_name: &str, account_id: i64, team_id: Option<i64>) -> Result<Vec<Bo3GameWinrateResult>> {
        if let Some(team_id) = team_id {
            let mut stmt = self.conn.prepare_cached(
                "SELECT 
                  g.game_number,
                  COUNT(*) AS total,
                  SUM(CASE WHEN g.winner = ?1 THEN 1 ELSE 0 END) AS wins
                FROM games g
                JOIN team_usage tu ON tu.game_id = g.id AND tu.team_id = ?2 AND tu.account_id = ?3
                WHERE g.match_id IN (
                  SELECT id FROM matches 
                  WHERE player1 = ?1 OR player2 = ?1
                )
                GROUP BY g.game_number
                ORDER BY g.game_number"
            )?;

            let results = stmt.query_map(params![player_name, team_id, account_id], |row| {
                Ok(Bo3GameWinrateResult {
                    game_number: row.get(0)?,
                    total: row.get(1)?,
                    wins: row.get(2)?,
                })
            })?.collect::<Result<Vec<_>>>()?;

            return Ok(results);
        }

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

    pub fn get_lead_stats(&self, player_name: &str, account_id: i64, team_id: Option<i64>) -> Result<Vec<StatResult>> {
        let raw_data: Vec<(String, i64)> = if let Some(team_id) = team_id {
            let mut stmt = self.conn.prepare_cached(
                "SELECT
                  gp.lead_pokemon,
                  CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END AS won
                 FROM game_players gp
                 JOIN games g ON gp.game_id = g.id
                 JOIN team_usage tu ON tu.game_id = gp.game_id AND tu.team_id = ?2 AND tu.account_id = ?3
                 WHERE gp.player_name = ?1
                   AND lead_pokemon IS NOT NULL
                   AND lead_pokemon != ''"
            )?;

            let rows = stmt.query_map(params![player_name, team_id, account_id], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
            })?.collect::<Result<Vec<_>>>()?;
            rows
        } else {
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

            let rows = stmt.query_map(params![player_name], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
            })?.collect::<Result<Vec<_>>>()?;
            rows
        };

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

    pub fn get_lead_combo_stats(
        &self,
        player_name: &str,
        account_id: i64,
        team_id: Option<i64>,
    ) -> Result<Vec<ComboStatResult>> {
        let raw_data: Vec<(String, i64)> = if let Some(team_id) = team_id {
            let mut stmt = self.conn.prepare_cached(
                "SELECT
                  gp.lead_pokemon,
                  CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END AS won
                 FROM game_players gp
                 JOIN games g ON gp.game_id = g.id
                 JOIN team_usage tu ON tu.game_id = gp.game_id AND tu.team_id = ?2 AND tu.account_id = ?3
                 WHERE gp.player_name = ?1
                   AND lead_pokemon IS NOT NULL
                   AND lead_pokemon != ''"
            )?;

            let rows = stmt.query_map(params![player_name, team_id, account_id], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
            })?.collect::<Result<Vec<_>>>()?;
            rows
        } else {
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

            let rows = stmt.query_map(params![player_name], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
            })?.collect::<Result<Vec<_>>>()?;
            rows
        };

        let mut combo_stats: std::collections::HashMap<String, (Vec<String>, i64, i64)> = std::collections::HashMap::new();

        for (lead_pokemon, won) in raw_data {
            let mut names: Vec<String> = lead_pokemon
                .split(';')
                .map(|pokemon| pokemon.trim())
                .filter(|pokemon| !pokemon.is_empty())
                .map(|pokemon| pokemon.to_string())
                .collect();

            if names.len() < 2 {
                continue;
            }

            names.sort_by(|a, b| a.to_lowercase().cmp(&b.to_lowercase()));
            names.dedup_by(|a, b| a.eq_ignore_ascii_case(b));

            if names.len() < 2 {
                continue;
            }

            if names.len() > 2 {
                names.truncate(2);
            }

            let key = names
                .iter()
                .map(|name| name.to_lowercase())
                .collect::<Vec<_>>()
                .join("|");

            let entry = combo_stats.entry(key).or_insert((names.clone(), 0, 0));
            entry.1 += 1;
            entry.2 += won;
        }

        let results: Vec<ComboStatResult> = combo_stats
            .into_iter()
            .map(|(_, (pokemon, total, wins))| ComboStatResult {
                pokemon,
                total,
                wins,
            })
            .collect();

        Ok(results)
    }

    pub fn get_tera_stats(&self, player_name: &str, account_id: i64, team_id: Option<i64>) -> Result<Vec<StatResult>> {
        let results = if let Some(team_id) = team_id {
            let mut stmt = self.conn.prepare_cached(
                "SELECT tera_used AS tera_type, COUNT(*) AS total,
                  SUM(CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END) AS wins
                 FROM game_players gp
                 JOIN games g ON gp.game_id = g.id
                 JOIN team_usage tu ON tu.game_id = gp.game_id AND tu.team_id = ?2 AND tu.account_id = ?3
                 WHERE gp.player_name = ?1 AND tera_used IS NOT NULL AND tera_used != ''
                 GROUP BY tera_used"
            )?;

            let rows = stmt.query_map(params![player_name, team_id, account_id], |row| {
                Ok(StatResult {
                    pokemon: None,
                    tera_type: row.get(0)?,
                    total: row.get(1)?,
                    wins: row.get(2)?,
                })
            })?.collect::<Result<Vec<_>>>()?;
            rows
        } else {
            let mut stmt = self.conn.prepare_cached(
                "SELECT tera_used AS tera_type, COUNT(*) AS total,
                  SUM(CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END) AS wins
                 FROM game_players gp
                 JOIN games g ON gp.game_id = g.id
                 WHERE gp.player_name = ?1 AND tera_used IS NOT NULL AND tera_used != ''
                 GROUP BY tera_used"
            )?;

            let rows = stmt.query_map(params![player_name], |row| {
                Ok(StatResult {
                    pokemon: None,
                    tera_type: row.get(0)?,
                    total: row.get(1)?,
                    wins: row.get(2)?,
                })
            })?.collect::<Result<Vec<_>>>()?;
            rows
        };

        Ok(results)
    }

    pub fn get_history(&self, player_name: &str, account_id: i64, team_id: Option<i64>) -> Result<Vec<HistoryResult>> {
        let results = if let Some(team_id) = team_id {
            let mut stmt = self.conn.prepare_cached(
                "SELECT g.match_id AS match_id, g.id AS game_id, g.game_number, g.winner,
                       gp.team_pokemon AS player_team, gp.lead_pokemon AS player_lead, gp.tera_used AS player_tera, gp.ots AS player_ots,
                       opp.player_name AS opponent, opp.team_pokemon AS opponent_team, opp.lead_pokemon AS opponent_lead, opp.tera_used AS opponent_tera, opp.ots AS opponent_ots
                 FROM games g
                 JOIN matches m ON g.match_id = m.id
                 JOIN team_usage tu ON tu.game_id = g.id AND tu.team_id = ?2 AND tu.account_id = ?3
                 JOIN game_players gp ON g.id = gp.game_id AND gp.player_name = ?1
                 JOIN game_players opp ON g.id = opp.game_id AND opp.player_name != ?1
                 ORDER BY g.id DESC
                 LIMIT 100"
            )?;

            let rows = stmt.query_map(params![player_name, team_id, account_id], |row| {
                Ok(HistoryResult {
                    match_id: row.get(0)?,
                    game_id: row.get(1)?,
                    game_number: row.get(2)?,
                    winner: row.get(3)?,
                    player_team: row.get(4)?,
                    player_lead: row.get(5)?,
                    player_tera: row.get(6)?,
                    player_ots: row.get(7)?,
                    opponent: row.get(8)?,
                    opponent_team: row.get(9)?,
                    opponent_lead: row.get(10)?,
                    opponent_tera: row.get(11)?,
                    opponent_ots: row.get(12)?,
                })
            })?.collect::<Result<Vec<_>>>()?;
            rows
        } else {
            let mut stmt = self.conn.prepare_cached(
                "SELECT g.match_id AS match_id, g.id AS game_id, g.game_number, g.winner,
                       gp.team_pokemon AS player_team, gp.lead_pokemon AS player_lead, gp.tera_used AS player_tera, gp.ots AS player_ots,
                       opp.player_name AS opponent, opp.team_pokemon AS opponent_team, opp.lead_pokemon AS opponent_lead, opp.tera_used AS opponent_tera, opp.ots AS opponent_ots
                 FROM games g
                 JOIN matches m ON g.match_id = m.id
                 JOIN game_players gp ON g.id = gp.game_id AND gp.player_name = ?1
                 JOIN game_players opp ON g.id = opp.game_id AND opp.player_name != ?2
                 ORDER BY g.id DESC
                 LIMIT 100"
            )?;

            let rows = stmt.query_map(params![player_name, player_name], |row| {
                Ok(HistoryResult {
                    match_id: row.get(0)?,
                    game_id: row.get(1)?,
                    game_number: row.get(2)?,
                    winner: row.get(3)?,
                    player_team: row.get(4)?,
                    player_lead: row.get(5)?,
                    player_tera: row.get(6)?,
                    player_ots: row.get(7)?,
                    opponent: row.get(8)?,
                    opponent_team: row.get(9)?,
                    opponent_lead: row.get(10)?,
                    opponent_tera: row.get(11)?,
                    opponent_ots: row.get(12)?,
                })
            })?.collect::<Result<Vec<_>>>()?;
            rows
        };

        Ok(results)
    }

    // Account methods

    pub fn create_account(&self, name: &str) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO accounts (name) VALUES (?1)",
            params![name],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_all_accounts(&self) -> Result<Vec<Account>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, name, created_at, is_active FROM accounts ORDER BY name"
        )?;

        let accounts = stmt.query_map([], |row| {
            Ok(Account {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                is_active: row.get::<_, i32>(3)? == 1,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(accounts)
    }

    pub fn get_account_by_name(&self, name: &str) -> Result<Option<Account>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, name, created_at, is_active FROM accounts WHERE name = ?1"
        )?;

        let mut rows = stmt.query(params![name])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some(Account {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                is_active: row.get::<_, i32>(3)? == 1,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_account_by_id(&self, account_id: i64) -> Result<Option<Account>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, name, created_at, is_active FROM accounts WHERE id = ?1"
        )?;

        let mut rows = stmt.query(params![account_id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Account {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                is_active: row.get::<_, i32>(3)? == 1,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn update_account_active(&self, account_id: i64, is_active: bool) -> Result<()> {
        self.conn.execute(
            "UPDATE accounts SET is_active = ?1 WHERE id = ?2",
            params![if is_active { 1 } else { 0 }, account_id],
        )?;
        Ok(())
    }

    // Team methods

    pub fn create_team(&self, name: &str, account_id: Option<i64>, team_data: &str) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO teams (name, account_id, team_data) VALUES (?1, ?2, ?3)",
            params![name, account_id, team_data],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_all_teams(&self) -> Result<Vec<Team>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, name, account_id, team_data, created_at, last_used, games_played, wins
             FROM teams ORDER BY created_at DESC"
        )?;

        let teams = stmt.query_map([], |row| {
            Ok(Team {
                id: row.get(0)?,
                name: row.get(1)?,
                account_id: row.get(2)?,
                team_data: row.get(3)?,
                created_at: row.get(4)?,
                last_used: row.get(5)?,
                games_played: row.get(6)?,
                wins: row.get(7)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(teams)
    }

    pub fn get_teams_by_account(&self, account_id: i64) -> Result<Vec<Team>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, name, account_id, team_data, created_at, last_used, games_played, wins
             FROM teams WHERE account_id = ?1 ORDER BY created_at DESC"
        )?;

        let teams = stmt.query_map(params![account_id], |row| {
            Ok(Team {
                id: row.get(0)?,
                name: row.get(1)?,
                account_id: row.get(2)?,
                team_data: row.get(3)?,
                created_at: row.get(4)?,
                last_used: row.get(5)?,
                games_played: row.get(6)?,
                wins: row.get(7)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(teams)
    }

    pub fn get_team_by_id(&self, team_id: i64) -> Result<Option<Team>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, name, account_id, team_data, created_at, last_used, games_played, wins
             FROM teams WHERE id = ?1"
        )?;

        let mut rows = stmt.query(params![team_id])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some(Team {
                id: row.get(0)?,
                name: row.get(1)?,
                account_id: row.get(2)?,
                team_data: row.get(3)?,
                created_at: row.get(4)?,
                last_used: row.get(5)?,
                games_played: row.get(6)?,
                wins: row.get(7)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn update_team(&self, team_id: i64, name: Option<&str>, team_data: Option<&str>) -> Result<()> {
        if let Some(name) = name {
            self.conn.execute(
                "UPDATE teams SET name = ?1 WHERE id = ?2",
                params![name, team_id],
            )?;
        }
        if let Some(team_data) = team_data {
            self.conn.execute(
                "UPDATE teams SET team_data = ?1 WHERE id = ?2",
                params![team_data, team_id],
            )?;
        }
        Ok(())
    }

    pub fn update_team_stats(&self, team_id: i64, won: bool) -> Result<()> {
        self.conn.execute(
            "UPDATE teams SET games_played = games_played + 1, wins = wins + ?1, last_used = CURRENT_TIMESTAMP WHERE id = ?2",
            params![if won { 1 } else { 0 }, team_id],
        )?;
        Ok(())
    }

    pub fn delete_team(&self, team_id: i64) -> Result<()> {
        self.conn.execute("DELETE FROM teams WHERE id = ?1", params![team_id])?;
        Ok(())
    }

    // Team usage methods

    pub fn record_team_usage(&self, game_id: i64, team_id: i64, account_id: i64) -> Result<()> {
        self.conn.execute(
            "INSERT INTO team_usage (game_id, team_id, account_id) VALUES (?1, ?2, ?3)",
            params![game_id, team_id, account_id],
        )?;
        Ok(())
    }

    pub fn get_team_usage_by_game(&self, game_id: i64) -> Result<Option<(i64, i64)>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT team_id, account_id FROM team_usage WHERE game_id = ?1"
        )?;

        let mut rows = stmt.query(params![game_id])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some((row.get(0)?, row.get(1)?)))
        } else {
            Ok(None)
        }
    }

    // Move usage methods

    pub fn record_move_usage(&self, game_id: i64, account_id: i64, pokemon_name: &str, move_name: &str) -> Result<()> {
        // Check if this move usage already exists for this game
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, usage_count FROM move_usage WHERE game_id = ?1 AND account_id = ?2 AND pokemon_name = ?3 AND move_name = ?4"
        )?;

        let mut rows = stmt.query(params![game_id, account_id, pokemon_name, move_name])?;
        
        if let Some(row) = rows.next()? {
            let id: i64 = row.get(0)?;
            let count: i64 = row.get(1)?;
            self.conn.execute(
                "UPDATE move_usage SET usage_count = ?1 WHERE id = ?2",
                params![count + 1, id],
            )?;
        } else {
            self.conn.execute(
                "INSERT INTO move_usage (game_id, account_id, pokemon_name, move_name, usage_count) VALUES (?1, ?2, ?3, ?4, 1)",
                params![game_id, account_id, pokemon_name, move_name],
            )?;
        }
        Ok(())
    }

    pub fn get_move_stats(&self, account_id: i64, team_id: Option<i64>) -> Result<Vec<MoveStats>> {
        let query = if team_id.is_some() {
            // Get move stats for a specific team
            "SELECT mu.pokemon_name, mu.move_name,
                    SUM(mu.usage_count) as total_usage,
                    COUNT(DISTINCT mu.game_id) as games_played,
                    SUM(CASE WHEN g.winner = gp.player_name THEN 1.0 ELSE 0.0 END) / COUNT(*) * 100.0 as win_rate
             FROM move_usage mu
             JOIN games g ON mu.game_id = g.id
             JOIN game_players gp ON g.id = gp.game_id AND gp.player_name = (SELECT name FROM accounts WHERE id = ?1)
             JOIN team_usage tu ON mu.game_id = tu.game_id AND tu.team_id = ?2
             WHERE mu.account_id = ?1
             GROUP BY mu.pokemon_name, mu.move_name
             ORDER BY total_usage DESC"
        } else {
            // Get move stats for all teams of an account
            "SELECT mu.pokemon_name, mu.move_name,
                    SUM(mu.usage_count) as total_usage,
                    COUNT(DISTINCT mu.game_id) as games_played,
                    SUM(CASE WHEN g.winner = gp.player_name THEN 1.0 ELSE 0.0 END) / COUNT(*) * 100.0 as win_rate
             FROM move_usage mu
             JOIN games g ON mu.game_id = g.id
             JOIN game_players gp ON g.id = gp.game_id AND gp.player_name = (SELECT name FROM accounts WHERE id = ?1)
             WHERE mu.account_id = ?1
             GROUP BY mu.pokemon_name, mu.move_name
             ORDER BY total_usage DESC"
        };

        let mut stmt = self.conn.prepare_cached(query)?;

        let stats = if let Some(team_id) = team_id {
            let rows = stmt.query_map(params![account_id, team_id], |row| {
                Ok(MoveStats {
                    pokemon_name: row.get(0)?,
                    move_name: row.get(1)?,
                    total_usage: row.get(2)?,
                    games_played: row.get(3)?,
                    win_rate: row.get(4)?,
                })
            })?.collect::<Result<Vec<_>>>()?;
            rows
        } else {
            let rows = stmt.query_map(params![account_id], |row| {
                Ok(MoveStats {
                    pokemon_name: row.get(0)?,
                    move_name: row.get(1)?,
                    total_usage: row.get(2)?,
                    games_played: row.get(3)?,
                    win_rate: row.get(4)?,
                })
            })?.collect::<Result<Vec<_>>>()?;
            rows
        };

        Ok(stats)
    }

    pub fn get_move_stats_by_pokemon(&self, account_id: i64, pokemon_name: &str) -> Result<Vec<MoveStats>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT mu.pokemon_name, mu.move_name,
                    SUM(mu.usage_count) as total_usage,
                    COUNT(DISTINCT mu.game_id) as games_played,
                    SUM(CASE WHEN g.winner = gp.player_name THEN 1.0 ELSE 0.0 END) / COUNT(*) * 100.0 as win_rate
             FROM move_usage mu
             JOIN games g ON mu.game_id = g.id
             JOIN game_players gp ON g.id = gp.game_id AND gp.player_name = (SELECT name FROM accounts WHERE id = ?1)
             WHERE mu.account_id = ?1 AND mu.pokemon_name = ?2
             GROUP BY mu.pokemon_name, mu.move_name
             ORDER BY total_usage DESC"
        )?;

        let stats = stmt.query_map(params![account_id, pokemon_name], |row| {
            Ok(MoveStats {
                pokemon_name: row.get(0)?,
                move_name: row.get(1)?,
                total_usage: row.get(2)?,
                games_played: row.get(3)?,
                win_rate: row.get(4)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(stats)
    }

    pub fn get_move_usage_by_game(&self, game_id: i64) -> Result<Vec<MoveUsage>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, game_id, account_id, pokemon_name, move_name, usage_count
             FROM move_usage
             WHERE game_id = ?1"
        )?;

        let usages = stmt.query_map(params![game_id], |row| {
            Ok(MoveUsage {
                id: row.get(0)?,
                game_id: row.get(1)?,
                account_id: row.get(2)?,
                pokemon_name: row.get(3)?,
                move_name: row.get(4)?,
                usage_count: row.get(5)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(usages)
    }

    pub fn get_move_usage_by_account(&self, account_id: i64) -> Result<Vec<MoveUsage>> {
        let mut stmt = self.conn.prepare_cached(
            "SELECT id, game_id, account_id, pokemon_name, move_name, usage_count
             FROM move_usage
             WHERE account_id = ?1
             ORDER BY game_id DESC"
        )?;

        let usages = stmt.query_map(params![account_id], |row| {
            Ok(MoveUsage {
                id: row.get(0)?,
                game_id: row.get(1)?,
                account_id: row.get(2)?,
                pokemon_name: row.get(3)?,
                move_name: row.get(4)?,
                usage_count: row.get(5)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(usages)
    }
}

fn initialize_schema(conn: &Connection) -> Result<()> {
    conn.execute_batch(SCHEMA_SQL)?;

    // Add columns for older databases without failing startup.
    let _ = conn.execute("ALTER TABLE game_players ADD COLUMN team_id INTEGER", []);

    Ok(())
}
