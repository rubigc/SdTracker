use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use std::io::{BufRead, BufReader};
use std::time::Instant;

pub struct BackendManager {
    process: Arc<Mutex<Option<Child>>>,
    logs: Arc<Mutex<Vec<String>>>,
    start_time: Arc<Mutex<Option<Instant>>>,
}

impl BackendManager {
    pub fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            logs: Arc::new(Mutex::new(Vec::new())),
            start_time: Arc::new(Mutex::new(None)),
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
        
        // Get the resources directory to set as working directory
        let mut resources_dir = backend_path.clone();
        resources_dir.pop(); // Remove backend-api executable name
        
        let mut child = Command::new(&backend_path)
            .current_dir(&resources_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start backend: {}", e))?;
        
        // Capture stdout
        if let Some(stdout) = child.stdout.take() {
            let logs = self.logs.clone();
            let reader = BufReader::new(stdout);
            std::thread::spawn(move || {
                for line in reader.lines() {
                    if let Ok(log_line) = line {
                        let mut logs_guard = logs.lock().unwrap();
                        logs_guard.push(log_line);
                        // Keep only last 1000 logs
                        if logs_guard.len() > 1000 {
                            logs_guard.remove(0);
                        }
                    }
                }
            });
        }

        // Capture stderr
        if let Some(stderr) = child.stderr.take() {
            let logs = self.logs.clone();
            let reader = BufReader::new(stderr);
            std::thread::spawn(move || {
                for line in reader.lines() {
                    if let Ok(log_line) = line {
                        let mut logs_guard = logs.lock().unwrap();
                        logs_guard.push(format!("ERROR: {}", log_line));
                        // Keep only last 1000 logs
                        if logs_guard.len() > 1000 {
                            logs_guard.remove(0);
                        }
                    }
                }
            });
        }
        
        *process_guard = Some(child);
        *self.start_time.lock().unwrap() = Some(Instant::now());
        
        Ok(())
    }
    
    pub fn stop(&self) -> Result<(), String> {
        let mut process_guard = self.process.lock().unwrap();
        
        if let Some(mut child) = process_guard.take() {
            child.kill()
                .map_err(|e| format!("Failed to stop backend: {}", e))?;
            child.wait().ok();
        }
        
        *self.start_time.lock().unwrap() = None;
        
        Ok(())
    }
    
    pub fn is_running(&self) -> bool {
        self.process.lock().unwrap().is_some()
    }
    
    pub fn get_status(&self) -> BackendStatus {
        let running = self.is_running();
        let uptime = self.start_time.lock().unwrap()
            .map(|t| t.elapsed().as_secs())
            .unwrap_or(0);
        let logs = self.logs.lock().unwrap().clone();
        
        BackendStatus {
            running,
            port: 8080,
            uptime,
            logs,
        }
    }
    
    pub fn get_logs(&self) -> Vec<String> {
        self.logs.lock().unwrap().clone()
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

#[derive(serde::Serialize)]
pub struct BackendStatus {
    pub running: bool,
    pub port: u16,
    pub uptime: u64,
    pub logs: Vec<String>,
}
