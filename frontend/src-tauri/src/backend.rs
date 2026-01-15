use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use std::path::PathBuf;

pub struct BackendManager {
    process: Arc<Mutex<Option<Child>>>,
}

impl BackendManager {
    pub fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
        }
    }
    
    pub fn start(&self) -> Result<(), String> {
        let mut process_guard = self.process.lock().unwrap();
        
        if process_guard.is_some() {
            return Err("Backend is already running".to_string());
        }
        
        let backend_path = get_resource_path(if cfg!(windows) {
            "backend-api.exe"
        } else {
            "backend-api"
        });
        
        let child = Command::new(&backend_path)
            .spawn()
            .map_err(|e| format!("Failed to start backend: {}", e))?;
        
        *process_guard = Some(child);
        Ok(())
    }
    
    pub fn stop(&self) -> Result<(), String> {
        let mut process_guard = self.process.lock().unwrap();
        
        if let Some(mut child) = process_guard.take() {
            child.kill()
                .map_err(|e| format!("Failed to stop backend: {}", e))?;
            child.wait().ok();
        }
        
        Ok(())
    }
    
    pub fn is_running(&self) -> bool {
        self.process.lock().unwrap().is_some()
    }
}

fn get_resource_path(resource_name: &str) -> PathBuf {
    let mut path = std::env::current_exe()
        .expect("Failed to get executable path");
    path.pop();
    path.push("resources");
    path.push(resource_name);
    path
}
