mod parser;
mod backend;

use parser::ParserManager;
use backend::BackendManager;
use std::sync::Arc;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let parser_manager = Arc::new(ParserManager::new());
    let backend_manager = Arc::new(BackendManager::new());
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(parser_manager)
        .manage(backend_manager)
        .invoke_handler(tauri::generate_handler![
            start_parser,
            stop_parser,
            get_parser_status,
            start_backend,
            stop_backend,
            is_backend_running,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
