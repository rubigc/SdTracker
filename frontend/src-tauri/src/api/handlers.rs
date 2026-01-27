use actix_web::{web, HttpResponse, Responder};
use reqwest::Url;
use std::sync::{Arc, Mutex};
use super::models::*;
use super::db::Database;

pub async fn health() -> impl Responder {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        message: "API is running".to_string(),
    })
}

pub async fn get_winrates(
    path: web::Path<i64>,
    query: web::Query<std::collections::HashMap<String, String>>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let account_id = path.into_inner();
    let team_id = query.get("team_id").and_then(|s| s.parse::<i64>().ok());
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    let account = match db_guard.get_account_by_id(account_id) {
        Ok(Some(account)) => account,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Account not found"
            }));
        }
        Err(e) => {
            eprintln!("Error fetching account: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch account",
                "details": e.to_string()
            }));
        }
    };

    match get_winrate_stats(&db_guard, &account.name, account.id, team_id) {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            eprintln!("Error getting winrates: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch winrates",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_leads(
    path: web::Path<i64>,
    query: web::Query<std::collections::HashMap<String, String>>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let account_id = path.into_inner();
    let team_id = query.get("team_id").and_then(|s| s.parse::<i64>().ok());
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    let account = match db_guard.get_account_by_id(account_id) {
        Ok(Some(account)) => account,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Account not found"
            }));
        }
        Err(e) => {
            eprintln!("Error fetching account: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch account",
                "details": e.to_string()
            }));
        }
    };

    match get_lead_stats(&db_guard, &account.name, account.id, team_id) {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            eprintln!("Error getting leads: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch lead stats",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_tera(
    path: web::Path<i64>,
    query: web::Query<std::collections::HashMap<String, String>>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let account_id = path.into_inner();
    let team_id = query.get("team_id").and_then(|s| s.parse::<i64>().ok());
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    let account = match db_guard.get_account_by_id(account_id) {
        Ok(Some(account)) => account,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Account not found"
            }));
        }
        Err(e) => {
            eprintln!("Error fetching account: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch account",
                "details": e.to_string()
            }));
        }
    };

    match get_tera_stats(&db_guard, &account.name, account.id, team_id) {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            eprintln!("Error getting tera: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch tera stats",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_history(
    path: web::Path<i64>,
    query: web::Query<std::collections::HashMap<String, String>>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let account_id = path.into_inner();
    let team_id = query.get("team_id").and_then(|s| s.parse::<i64>().ok());
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    let account = match db_guard.get_account_by_id(account_id) {
        Ok(Some(account)) => account,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Account not found"
            }));
        }
        Err(e) => {
            eprintln!("Error fetching account: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch account",
                "details": e.to_string()
            }));
        }
    };

    match get_history_games(&db_guard, &account.name, account.id, team_id) {
        Ok(games) => HttpResponse::Ok().json(games),
        Err(e) => {
            eprintln!("Error getting history: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch history",
                "details": e.to_string()
            }))
        }
    }
}

fn get_winrate_stats(
    db: &Database,
    player_name: &str,
    account_id: i64,
    team_id: Option<i64>,
) -> Result<WinrateStats, Box<dyn std::error::Error>> {
    let overall = db.get_overall_winrate(player_name, account_id, team_id)?;
    let bo3 = db.get_bo3_winrate(player_name, account_id, team_id)?;
    let bo3_games = db.get_bo3_game_winrates(player_name, account_id, team_id)?;
    
    let overall_win_rate = if overall.total > 0 {
        (overall.wins as f64 / overall.total as f64) * 100.0
    } else {
        0.0
    };
    
    let bo3_win_rate = if bo3.total > 0 {
        (bo3.wins as f64 / bo3.total as f64) * 100.0
    } else {
        0.0
    };
    
    let mut bo3_game_winrates = std::collections::HashMap::new();
    for game in bo3_games {
        let win_rate = if game.total > 0 {
            (game.wins as f64 / game.total as f64) * 100.0
        } else {
            0.0
        };
        
        let game_key = format!("Game {}", game.game_number);
        bo3_game_winrates.insert(game_key, GameWR {
            win_rate,
            games_played: game.total,
        });
    }
    
    Ok(WinrateStats {
        overall_win_rate,
        games_played: overall.total,
        bo3_win_rate,
        bo3_played: bo3.total,
        bo3_game_winrates,
    })
}

fn get_lead_stats(
    db: &Database,
    player_name: &str,
    account_id: i64,
    team_id: Option<i64>,
) -> Result<Vec<LeadStat>, Box<dyn std::error::Error>> {
    let results = db.get_lead_stats(player_name, account_id, team_id)?;
    
    let mut stats: Vec<LeadStat> = results
        .into_iter()
        .filter_map(|r| r.pokemon.map(|pokemon| {
            let win_rate = if r.total > 0 {
                (r.wins as f64 / r.total as f64) * 100.0
            } else {
                0.0
            };
            
            LeadStat {
                pokemon,
                win_rate,
                games_played: r.total,
            }
        }))
        .collect();
    
    // Sort by games played (descending)
    stats.sort_by(|a, b| b.games_played.cmp(&a.games_played));
    
    Ok(stats)
}

fn get_tera_stats(
    db: &Database,
    player_name: &str,
    account_id: i64,
    team_id: Option<i64>,
) -> Result<Vec<TeraStat>, Box<dyn std::error::Error>> {
    let results = db.get_tera_stats(player_name, account_id, team_id)?;
    
    let mut stats: Vec<TeraStat> = results
        .into_iter()
        .filter_map(|r| {
            // tera_used stores the Pokemon name that Terastallized, not the Tera type
            r.tera_type.map(|pokemon| {
                let win_rate = if r.total > 0 {
                    (r.wins as f64 / r.total as f64) * 100.0
                } else {
                    0.0
                };
                
                TeraStat {
                    pokemon,
                    win_rate,
                    games_played: r.total,
                }
            })
        })
        .collect();
    
    // Sort by games played (descending)
    stats.sort_by(|a, b| b.games_played.cmp(&a.games_played));
    
    Ok(stats)
}

fn get_history_games(
    db: &Database,
    player_name: &str,
    account_id: i64,
    team_id: Option<i64>,
) -> Result<Vec<HistoryGame>, Box<dyn std::error::Error>> {
    let results = db.get_history(player_name, account_id, team_id)?;
    
    let games: Vec<HistoryGame> = results
        .into_iter()
        .map(|r| {
            let player = Player {
                name: player_name.to_string(),
                team: r.player_team,
                lead: r.player_lead,
                tera: r.player_tera,
                ots: None,
            };
            
            let opponent = Player {
                name: r.opponent.unwrap_or_else(|| "Unknown".to_string()),
                team: r.opponent_team,
                lead: r.opponent_lead,
                tera: r.opponent_tera,
                ots: None,
            };
            
            HistoryGame {
                game_id: r.game_id,
                game_number: r.game_number,
                winner: r.winner.unwrap_or_else(|| "Unknown".to_string()),
                player,
                opponent,
            }
        })
        .collect();
    
    Ok(games)
}

// Account handlers

pub async fn get_accounts(
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_all_accounts() {
        Ok(accounts) => HttpResponse::Ok().json(accounts),
        Err(e) => {
            eprintln!("Error getting accounts: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch accounts",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_account_by_name(
    path: web::Path<String>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let name = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_account_by_name(&name) {
        Ok(Some(account)) => HttpResponse::Ok().json(account),
        Ok(None) => {
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "Account not found"
            }))
        }
        Err(e) => {
            eprintln!("Error getting account by name: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch account",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn create_account(
    req: web::Json<CreateAccountRequest>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.create_account(&req.name) {
        Ok(id) => HttpResponse::Ok().json(serde_json::json!({
            "id": id,
            "name": req.name
        })),
        Err(e) => {
            eprintln!("Error creating account: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create account",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn update_account(
    path: web::Path<i64>,
    req: web::Json<UpdateAccountRequest>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let account_id = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.update_account_active(account_id, req.is_active) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Account updated successfully"
        })),
        Err(e) => {
            eprintln!("Error updating account: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update account",
                "details": e.to_string()
            }))
        }
    }
}

// Team handlers

pub async fn get_teams(
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_all_teams() {
        Ok(teams) => HttpResponse::Ok().json(teams),
        Err(e) => {
            eprintln!("Error getting teams: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch teams",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_teams_by_account(
    path: web::Path<i64>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let account_id = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_teams_by_account(account_id) {
        Ok(teams) => HttpResponse::Ok().json(teams),
        Err(e) => {
            eprintln!("Error getting teams: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch teams",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn create_team(
    req: web::Json<CreateTeamRequest>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let resolved_team_data = match resolve_team_data(&req.team_data).await {
        Ok(data) => data,
        Err(message) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Invalid team data",
                "details": message
            }));
        }
    };

    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.create_team(&req.name, req.account_id, &resolved_team_data) {
        Ok(id) => HttpResponse::Ok().json(serde_json::json!({
            "id": id,
            "name": req.name
        })),
        Err(e) => {
            eprintln!("Error creating team: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create team",
                "details": e.to_string()
            }))
        }
    }
}

async fn resolve_team_data(input: &str) -> Result<String, String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Ok(String::new());
    }
    if trimmed.split_whitespace().count() != 1 {
        return Ok(input.to_string());
    }

    match parse_pokepast_raw_url(trimmed)? {
        Some(raw_url) => fetch_pokepast_raw(&raw_url).await,
        None => Ok(input.to_string()),
    }
}

fn parse_pokepast_raw_url(input: &str) -> Result<Option<String>, String> {
    let candidate = if input.starts_with("http://") || input.starts_with("https://") {
        input.to_string()
    } else {
        format!("https://{}", input)
    };

    let url = match Url::parse(&candidate) {
        Ok(url) => url,
        Err(_) => {
            if input.contains("pokepast.es") {
                return Err("Invalid Pokepast URL.".to_string());
            }
            return Ok(None);
        }
    };

    let host = url.host_str().unwrap_or("").to_ascii_lowercase();
    if host != "pokepast.es" && host != "www.pokepast.es" {
        return Ok(None);
    }

    let mut segments = url
        .path_segments()
        .ok_or_else(|| "Pokepast link is missing a paste id.".to_string())?;
    let id = segments.next().unwrap_or("");
    if id.is_empty() || id.eq_ignore_ascii_case("raw") {
        return Err("Pokepast link is missing a paste id.".to_string());
    }

    Ok(Some(format!("https://pokepast.es/{}/raw", id)))
}

async fn fetch_pokepast_raw(raw_url: &str) -> Result<String, String> {
    let response = reqwest::get(raw_url)
        .await
        .map_err(|e| format!("Failed to fetch Pokepast: {}", e))?;
    if !response.status().is_success() {
        return Err(format!(
            "Pokepast request failed with status {}.",
            response.status()
        ));
    }
    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read Pokepast response: {}", e))?;
    if text.trim().is_empty() {
        return Err("Pokepast paste is empty.".to_string());
    }
    Ok(text)
}

pub async fn update_team(
    path: web::Path<i64>,
    req: web::Json<UpdateTeamRequest>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let team_id = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.update_team(team_id, req.name.as_deref(), req.team_data.as_deref()) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Team updated successfully"
        })),
        Err(e) => {
            eprintln!("Error updating team: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update team",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn delete_team(
    path: web::Path<i64>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let team_id = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.delete_team(team_id) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Team deleted successfully"
        })),
        Err(e) => {
            eprintln!("Error deleting team: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to delete team",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_team_by_id(
    path: web::Path<i64>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let team_id = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_team_by_id(team_id) {
        Ok(Some(team)) => HttpResponse::Ok().json(team),
        Ok(None) => {
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "Team not found"
            }))
        }
        Err(e) => {
            eprintln!("Error getting team by id: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch team",
                "details": e.to_string()
            }))
        }
    }
}

// Move usage handlers

pub async fn get_move_stats(
    path: web::Path<i64>,
    query: web::Query<std::collections::HashMap<String, String>>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let account_id = path.into_inner();
    let team_id = query.get("team_id").and_then(|s| s.parse::<i64>().ok());
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_move_stats(account_id, team_id) {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            eprintln!("Error getting move stats: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch move stats",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn record_team_usage(
    req: web::Json<RecordTeamUsageRequest>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.record_team_usage(req.game_id, req.team_id, req.account_id) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Team usage recorded successfully"
        })),
        Err(e) => {
            eprintln!("Error recording team usage: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to record team usage",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn update_team_stats(
    req: web::Json<UpdateTeamStatsRequest>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.update_team_stats(req.team_id, req.won) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Team stats updated successfully"
        })),
        Err(e) => {
            eprintln!("Error updating team stats: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update team stats",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn record_move_usage(
    req: web::Json<RecordMoveUsageRequest>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.record_move_usage(req.game_id, req.account_id, &req.pokemon_name, &req.move_name) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Move usage recorded successfully"
        })),
        Err(e) => {
            eprintln!("Error recording move usage: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to record move usage",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_team_usage_by_game(
    path: web::Path<i64>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let game_id = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_team_usage_by_game(game_id) {
        Ok(Some((team_id, account_id))) => HttpResponse::Ok().json(serde_json::json!({
            "team_id": team_id,
            "account_id": account_id
        })),
        Ok(None) => {
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "Team usage not found for this game"
            }))
        }
        Err(e) => {
            eprintln!("Error getting team usage by game: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch team usage",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_move_usage_by_game(
    path: web::Path<i64>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let game_id = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_move_usage_by_game(game_id) {
        Ok(usages) => HttpResponse::Ok().json(usages),
        Err(e) => {
            eprintln!("Error getting move usage by game: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch move usage",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_move_usage_by_account(
    path: web::Path<i64>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let account_id = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_move_usage_by_account(account_id) {
        Ok(usages) => HttpResponse::Ok().json(usages),
        Err(e) => {
            eprintln!("Error getting move usage by account: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch move usage",
                "details": e.to_string()
            }))
        }
    }
}

pub async fn get_move_stats_by_pokemon(
    path: web::Path<(i64, String)>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let (account_id, pokemon_name) = path.into_inner();
    
    let db_guard = match db.lock() {
        Ok(guard) => guard,
        Err(e) => {
            eprintln!("Error locking database: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database lock error",
                "details": e.to_string()
            }));
        }
    };
    
    match db_guard.get_move_stats_by_pokemon(account_id, &pokemon_name) {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            eprintln!("Error getting move stats: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch move stats",
                "details": e.to_string()
            }))
        }
    }
}
