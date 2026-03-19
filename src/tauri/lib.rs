use rusqlite::{Connection, params};
use serde::Serialize;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

struct AppDatabase(Mutex<Connection>);

fn get_db_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."));
    let app_dir = data_dir.join("com.devtoolkit.desktop");
    std::fs::create_dir_all(&app_dir).ok();
    app_dir.join("devtoolkit.db")
}

fn init_database(conn: &Connection) {
    conn.execute_batch("PRAGMA journal_mode = WAL;").ok();

    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )
    .expect("Failed to create settings table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS favourites (
            tool_path TEXT PRIMARY KEY
        )",
        [],
    )
    .expect("Failed to create favourites table");

    // Seed default settings
    conn.execute(
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?1, ?2)",
        params!["theme", "dark"],
    )
    .ok();
}

#[tauri::command]
fn get_setting(db: State<AppDatabase>, key: String) -> Option<String> {
    let conn = db.0.lock().unwrap();
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        params![key],
        |row| row.get(0),
    )
    .ok()
}

#[tauri::command]
fn set_setting(db: State<AppDatabase>, key: String, value: String) {
    let conn = db.0.lock().unwrap();
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )
    .ok();
}

#[tauri::command]
fn get_all_settings(db: State<AppDatabase>) -> HashMap<String, String> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")
        .expect("Failed to prepare statement");
    let rows = stmt
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .expect("Failed to query settings");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_favourites(db: State<AppDatabase>) -> Vec<String> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT tool_path FROM favourites")
        .expect("Failed to prepare statement");
    let rows = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .expect("Failed to query favourites");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn add_favourite(db: State<AppDatabase>, tool_path: String) {
    let conn = db.0.lock().unwrap();
    conn.execute(
        "INSERT OR IGNORE INTO favourites (tool_path) VALUES (?1)",
        params![tool_path],
    )
    .ok();
}

#[tauri::command]
fn remove_favourite(db: State<AppDatabase>, tool_path: String) {
    let conn = db.0.lock().unwrap();
    conn.execute(
        "DELETE FROM favourites WHERE tool_path = ?1",
        params![tool_path],
    )
    .ok();
}

#[derive(Serialize)]
struct BootstrapData {
    settings: HashMap<String, String>,
    favourites: Vec<String>,
}

#[tauri::command]
fn bootstrap(db: State<AppDatabase>) -> BootstrapData {
    let conn = db.0.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")
        .expect("Failed to prepare statement");
    let settings: HashMap<String, String> = stmt
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .expect("Failed to query settings")
        .filter_map(|r| r.ok())
        .collect();

    let mut stmt = conn
        .prepare("SELECT tool_path FROM favourites")
        .expect("Failed to prepare statement");
    let favourites: Vec<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .expect("Failed to query favourites")
        .filter_map(|r| r.ok())
        .collect();

    BootstrapData {
        settings,
        favourites,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = get_db_path();
    let conn = Connection::open(&db_path).expect("Failed to open database");
    init_database(&conn);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(AppDatabase(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![
            get_setting,
            set_setting,
            get_all_settings,
            get_favourites,
            add_favourite,
            remove_favourite,
            bootstrap,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
