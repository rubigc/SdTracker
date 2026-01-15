mod parser;
mod backend;
mod api;

use parser::ParserManager;
use backend::BackendManager;
use api::ApiServer;
use api::Database;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tauri::command]
async fn start_parser(
    username: String,
    manager: tauri::State<'_, Arc<ParserManager>>,
) -> Result<(), String> {
    manager.start(username)
}

#[tauri::command]
async fn stop_parser(
    manager: tauri::State<'_, Arc<ParserManager>>,
) -> Result<(), String> {
    manager.stop()
}

#[tauri::command]
async fn get_parser_status(
    manager: tauri::State<'_, Arc<ParserManager>>,
) -> Result<parser::ParserStatus, String> {
    Ok(manager.get_status())
}

#[tauri::command]
async fn start_backend(
    manager: tauri::State<'_, Arc<BackendManager>>,
) -> Result<(), String> {
    manager.start()
}

#[tauri::command]
async fn stop_backend(
    manager: tauri::State<'_, Arc<BackendManager>>,
) -> Result<(), String> {
    manager.stop()
}

#[tauri::command]
async fn is_backend_running(
    manager: tauri::State<'_, Arc<BackendManager>>,
) -> Result<bool, String> {
    Ok(manager.is_running())
}

#[tauri::command]
async fn get_backend_status(
    manager: tauri::State<'_, Arc<BackendManager>>,
) -> Result<backend::BackendStatus, String> {
    Ok(manager.get_status())
}

#[tauri::command]
async fn get_backend_logs(
    manager: tauri::State<'_, Arc<BackendManager>>,
) -> Result<Vec<String>, String> {
    Ok(manager.get_logs())
}

#[tauri::command]
async fn start_api_server(
    manager: tauri::State<'_, Arc<Mutex<ApiServer>>>,
) -> Result<(), String> {
    let mut server = manager.lock().await;
    let db = Arc::new(Mutex::new(Database::new().map_err(|e| e.to_string())?));
    server.start(db).map_err(|e| e.to_string())
}

#[tauri::command]
async fn stop_api_server(
    manager: tauri::State<'_, Arc<Mutex<ApiServer>>>,
) -> Result<(), String> {
    let mut server = manager.lock().await;
    server.stop();
    Ok(())
}

#[tauri::command]
async fn is_api_server_running(
    manager: tauri::State<'_, Arc<Mutex<ApiServer>>>,
) -> Result<bool, String> {
    let server = manager.lock().await;
    Ok(server.is_running())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let parser_manager = Arc::new(ParserManager::new());
    let backend_manager = Arc::new(BackendManager::new());
    let api_server = Arc::new(Mutex::new(ApiServer::new("127.0.0.1:3001".to_string())));
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(parser_manager)
        .manage(backend_manager)
        .manage(api_server)
        .invoke_handler(tauri::generate_handler![
            start_parser,
            stop_parser,
            get_parser_status,
            start_backend,
            stop_backend,
            is_backend_running,
            get_backend_status,
            get_backend_logs,
            start_api_server,
            stop_api_server,
            is_api_server_running,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
