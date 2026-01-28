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
    pub pokemon: String,
    pub win_rate: f64,
    pub games_played: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryGame {
    pub match_id: i64,
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

// Account models

#[derive(Debug, Serialize, Deserialize)]
pub struct Account {
    pub id: i64,
    pub name: String,
    pub created_at: String,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAccountRequest {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateAccountRequest {
    pub is_active: bool,
}

// Team models

#[derive(Debug, Serialize, Deserialize)]
pub struct Team {
    pub id: i64,
    pub name: String,
    pub account_id: Option<i64>,
    pub team_data: String,
    pub created_at: String,
    pub last_used: Option<String>,
    pub games_played: i64,
    pub wins: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTeamRequest {
    pub name: String,
    pub account_id: Option<i64>,
    pub team_data: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTeamRequest {
    pub name: Option<String>,
    pub team_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePokepasteRequest {
    pub text: String,
    pub title: Option<String>,
    pub author: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecordTeamUsageRequest {
    pub game_id: i64,
    pub team_id: i64,
    pub account_id: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTeamStatsRequest {
    pub team_id: i64,
    pub won: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecordMoveUsageRequest {
    pub game_id: i64,
    pub account_id: i64,
    pub pokemon_name: String,
    pub move_name: String,
}

// Move usage models

#[derive(Debug, Serialize, Deserialize)]
pub struct MoveUsage {
    pub id: i64,
    pub game_id: i64,
    pub account_id: i64,
    pub pokemon_name: String,
    pub move_name: String,
    pub usage_count: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MoveStats {
    pub pokemon_name: String,
    pub move_name: String,
    pub total_usage: i64,
    pub games_played: i64,
    pub win_rate: f64,
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
    pub match_id: i64,
    pub game_id: i64,
    pub game_number: i64,
    pub winner: Option<String>,
    pub player_team: Option<String>,
    pub player_lead: Option<String>,
    pub player_tera: Option<String>,
    pub player_ots: Option<String>,
    pub opponent: Option<String>,
    pub opponent_team: Option<String>,
    pub opponent_lead: Option<String>,
    pub opponent_tera: Option<String>,
    pub opponent_ots: Option<String>,
}
