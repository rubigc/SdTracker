mod parser;
mod api;

use parser::ParserManager;
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
async fn start_api_server(
    manager: tauri::State<'_, Arc<Mutex<ApiServer>>>,
) -> Result<(), String> {
    let mut server = manager.inner().lock().await;
    let db = Arc::new(Mutex::new(Database::new().map_err(|e| e.to_string())?));
    server.start(db).map_err(|e| e.to_string())
}

#[tauri::command]
async fn stop_api_server(
    manager: tauri::State<'_, Arc<Mutex<ApiServer>>>,
) -> Result<(), String> {
    let mut server = manager.inner().lock().await;
    server.stop();
    Ok(())
}

#[tauri::command]
async fn is_api_server_running(
    manager: tauri::State<'_, Arc<Mutex<ApiServer>>>,
) -> Result<bool, String> {
    let server = manager.inner().lock().await;
    Ok(server.is_running())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let parser_manager = Arc::new(ParserManager::new());
    let api_server = Arc::new(Mutex::new(ApiServer::new("127.0.0.1:3001".to_string())));
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(parser_manager)
        .manage(api_server)
        .invoke_handler(tauri::generate_handler![
            start_parser,
            stop_parser,
            get_parser_status,
            start_api_server,
            stop_api_server,
            is_api_server_running,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
