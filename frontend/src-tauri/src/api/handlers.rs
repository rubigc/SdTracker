use actix_web::{web, HttpResponse, Responder};
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
    path: web::Path<String>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let player_name = path.into_inner();
    
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
    
    match get_winrate_stats(&db_guard, &player_name) {
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
    path: web::Path<String>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let player_name = path.into_inner();
    
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
    
    match get_lead_stats(&db_guard, &player_name) {
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
    path: web::Path<String>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let player_name = path.into_inner();
    
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
    
    match get_tera_stats(&db_guard, &player_name) {
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
    path: web::Path<String>,
    db: web::Data<Arc<Mutex<Database>>>,
) -> impl Responder {
    let player_name = path.into_inner();
    
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
    
    match get_history_games(&db_guard, &player_name) {
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

fn get_winrate_stats(db: &Database, player_name: &str) -> Result<WinrateStats, Box<dyn std::error::Error>> {
    let overall = db.get_overall_winrate(player_name)?;
    let bo3 = db.get_bo3_winrate(player_name)?;
    let bo3_games = db.get_bo3_game_winrates(player_name)?;
    
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

fn get_lead_stats(db: &Database, player_name: &str) -> Result<Vec<LeadStat>, Box<dyn std::error::Error>> {
    let results = db.get_lead_stats(player_name)?;
    
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

fn get_tera_stats(db: &Database, player_name: &str) -> Result<Vec<TeraStat>, Box<dyn std::error::Error>> {
    let results = db.get_tera_stats(player_name)?;
    
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

fn get_history_games(db: &Database, player_name: &str) -> Result<Vec<HistoryGame>, Box<dyn std::error::Error>> {
    let results = db.get_history(player_name)?;
    
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
