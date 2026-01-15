use actix_web::{web, Scope};
use super::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/health", web::get().to(handlers::health))
            .route("/winrates/{name}", web::get().to(handlers::get_winrates))
            .route("/leads/{name}", web::get().to(handlers::get_leads))
            .route("/tera/{name}", web::get().to(handlers::get_tera))
            .route("/history/{name}", web::get().to(handlers::get_history))
    );
}
