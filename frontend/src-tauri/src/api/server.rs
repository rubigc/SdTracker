use actix_web::{App, HttpServer, web, middleware};
use actix_cors::Cors;
use std::sync::Arc;
use super::db::Database;
use super::routes;

pub struct ApiServer {
    addr: String,
    handle: Option<tokio::task::JoinHandle<Result<(), std::io::Error>>>,
}

impl ApiServer {
    pub fn new(addr: String) -> Self {
        ApiServer {
            addr,
            handle: None,
        }
    }

    pub fn start(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        let addr = self.addr.clone();
        
        // Create database connection - each worker will use this shared connection
        let db = Database::new().map_err(|e| format!("Failed to connect to database: {}", e))?;
        let db_data = web::Data::new(Arc::new(std::sync::Mutex::new(db)));
        
        let handle = tokio::task::spawn_blocking(move || {
            let rt = tokio::runtime::Runtime::new()?;
            
            rt.block_on(async move {
                HttpServer::new(move || {
                    App::new()
                        .wrap(middleware::Logger::default())
                        .wrap(
                            Cors::permissive()
                                .allowed_origin_fn(|_origin, _req_head| {
                                    true // Allow all origins for development
                                })
                                .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
                                .allowed_headers(vec!["*"])
                        )
                        .app_data(db_data.clone())
                        .configure(routes::configure_routes)
                })
                .bind(&addr)?
                .run()
                .await
            })
        });
        
        self.handle = Some(handle);
        Ok(())
    }

    pub fn stop(&mut self) {
        if let Some(handle) = self.handle.take() {
            handle.abort();
        }
    }

    pub fn is_running(&self) -> bool {
        self.handle.is_some()
    }
}
