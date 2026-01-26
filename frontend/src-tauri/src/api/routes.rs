use actix_web::web;
use super::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/health", web::get().to(handlers::health))
            // Account endpoints
            .route("/accounts", web::get().to(handlers::get_accounts))
            .route("/accounts", web::post().to(handlers::create_account))
            .route("/accounts/{id}", web::put().to(handlers::update_account))
            // Team endpoints
            .route("/teams", web::get().to(handlers::get_teams))
            .route("/teams", web::post().to(handlers::create_team))
            .route("/teams/{id}", web::put().to(handlers::update_team))
            .route("/teams/{id}", web::delete().to(handlers::delete_team))
            .route("/accounts/{id}/teams", web::get().to(handlers::get_teams_by_account))
            .route("/accounts/{id}/winrates", web::get().to(handlers::get_winrates))
            .route("/accounts/{id}/leads", web::get().to(handlers::get_leads))
            .route("/accounts/{id}/tera", web::get().to(handlers::get_tera))
            .route("/accounts/{id}/history", web::get().to(handlers::get_history))
            // Move usage endpoints
            .route("/accounts/{id}/moves", web::get().to(handlers::get_move_stats))
            .route("/accounts/{id}/moves/{pokemon}", web::get().to(handlers::get_move_stats_by_pokemon))
    );
}
