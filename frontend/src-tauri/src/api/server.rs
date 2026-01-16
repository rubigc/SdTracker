use actix_web::{App, HttpServer, web, middleware};
use actix_cors::Cors;
use std::sync::Arc;
use tokio::sync::Mutex;
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

    pub fn start(&mut self, db: Arc<Mutex<Database>>) -> Result<(), Box<dyn std::error::Error>> {
        let addr = self.addr.clone();
        let db_clone = Arc::clone(&db);
        
        let handle = tokio::task::spawn_blocking(move || {
            let rt = tokio::runtime::Runtime::new()?;
            let db = web::Data::new(db_clone);
            
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
                        .app_data(db.clone())
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
