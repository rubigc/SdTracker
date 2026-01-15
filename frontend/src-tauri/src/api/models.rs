use serde::{Deserialize, Serialize};

// Response models

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WinrateStats {
    pub overall_win_rate: f64,
    pub games_played: i64,
    pub bo3_win_rate: f64,
    pub bo3_played: i64,
    pub bo3_game_winrates: std::collections::HashMap<String, GameWR>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GameWR {
    pub win_rate: f64,
    pub games_played: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LeadStat {
    pub pokemon: String,
    pub win_rate: f64,
    pub games_played: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TeraStat {
    pub tera_type: String,
    pub win_rate: f64,
    pub games_played: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryGame {
    pub game_id: i64,
    pub game_number: i64,
    pub winner: String,
    pub player: Player,
    pub opponent: Player,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Player {
    pub name: String,
    pub team: Option<String>,
    pub lead: Option<String>,
    pub tera: Option<String>,
    pub ots: Option<String>,
}

// Database row models

#[derive(Debug)]
pub struct MatchRow {
    pub id: i64,
    pub match_uuid: Option<String>,
    pub player1: Option<String>,
    pub player2: Option<String>,
    pub winner: Option<i64>,
    pub match_date: Option<String>,
}

#[derive(Debug)]
pub struct GameRow {
    pub id: i64,
    pub match_id: Option<i64>,
    pub game_number: Option<i64>,
    pub match_uuid: Option<String>,
    pub winner: Option<String>,
    pub replay: Option<String>,
}

#[derive(Debug)]
pub struct GamePlayerRow {
    pub game_id: i64,
    pub player_name: String,
    pub team_pokemon: Option<String>,
    pub lead_pokemon: Option<String>,
    pub tera_used: Option<String>,
    pub ots: Option<String>,
}

// Query result models

#[derive(Debug)]
pub struct WinrateResult {
    pub wins: i64,
    pub total: i64,
}

#[derive(Debug)]
pub struct Bo3WinrateResult {
    pub wins: i64,
    pub total: i64,
}

#[derive(Debug)]
pub struct Bo3GameWinrateResult {
    pub game_number: i64,
    pub total: i64,
    pub wins: i64,
}

#[derive(Debug)]
pub struct StatResult {
    pub pokemon: Option<String>,
    pub tera_type: Option<String>,
    pub total: i64,
    pub wins: i64,
}

#[derive(Debug)]
pub struct HistoryResult {
    pub game_id: i64,
    pub game_number: i64,
    pub winner: Option<String>,
    pub player1: Option<String>,
    pub player2: Option<String>,
    pub match_date: Option<String>,
    pub player_team: Option<String>,
    pub player_lead: Option<String>,
    pub player_tera: Option<String>,
    pub opponent: Option<String>,
    pub opponent_team: Option<String>,
    pub opponent_lead: Option<String>,
    pub opponent_tera: Option<String>,
}
