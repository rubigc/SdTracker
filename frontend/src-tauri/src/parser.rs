use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use std::path::PathBuf;

pub struct ParserManager {
    process: Arc<Mutex<Option<Child>>>,
    start_time: Arc<Mutex<Option<Instant>>>,
    username: Arc<Mutex<Option<String>>>,
}

impl ParserManager {
    pub fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            start_time: Arc::new(Mutex::new(None)),
            username: Arc::new(Mutex::new(None)),
        }
    }
    
    pub fn start(&self, username: String) -> Result<(), String> {
        let mut process_guard = self.process.lock().unwrap();
        
        if process_guard.is_some() {
            return Err("Parser is already running".to_string());
        }
        
        let parser_path = get_resource_path(if cfg!(windows) {
            "parser.exe"
        } else {
            "parser"
        });
        
        let child = Command::new(&parser_path)
            .env("SHOWDOWN_USERNAME", &username)
            .spawn()
            .map_err(|e| format!("Failed to start parser: {}", e))?;
        
        *process_guard = Some(child);
        *self.start_time.lock().unwrap() = Some(Instant::now());
        *self.username.lock().unwrap() = Some(username);
        
        Ok(())
    }
    
    pub fn stop(&self) -> Result<(), String> {
        let mut process_guard = self.process.lock().unwrap();
        
        if let Some(mut child) = process_guard.take() {
            child.kill()
                .map_err(|e| format!("Failed to stop parser: {}", e))?;
            child.wait().ok();
        }
        
        *self.start_time.lock().unwrap() = None;
        *self.username.lock().unwrap() = None;
        
        Ok(())
    }
    
    pub fn is_running(&self) -> bool {
        self.process.lock().unwrap().is_some()
    }
    
    pub fn get_status(&self) -> ParserStatus {
        let running = self.is_running();
        let username = self.username.lock().unwrap().clone().unwrap_or_default();
        let uptime = self.start_time.lock().unwrap()
            .map(|t| t.elapsed().as_secs())
            .unwrap_or(0);
        
        ParserStatus {
            running,
            username,
            port: 8098,
            uptime,
            logs_received: 0, // Would need to track this
        }
    }
}

fn get_resource_path(resource_name: &str) -> PathBuf {
    let mut path = std::env::current_exe()
        .expect("Failed to get executable path");
    path.pop(); // Remove executable name
    path.push("resources");
    path.push(resource_name);
    path
}

#[derive(serde::Serialize)]
pub struct ParserStatus {
    pub running: bool,
    pub username: String,
    pub port: u16,
    pub uptime: u64,
    pub logs_received: u64,
}
