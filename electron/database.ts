import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

let db: Database.Database

const DEFAULT_SETTINGS: Record<string, string> = {
  theme: 'dark',
}

export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'devtoolkit.db')
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS favourites (
      tool_path TEXT PRIMARY KEY
    )
  `)

  // Seed default settings for any keys that don't exist yet
  const upsert = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  )
  const seedDefaults = db.transaction(() => {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      upsert.run(key, value)
    }
  })
  seedDefaults()
}

export function getSetting(key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value)
}

export function getAllSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as {
    key: string
    value: string
  }[]
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

export function getFavourites(): string[] {
  const rows = db.prepare('SELECT tool_path FROM favourites').all() as { tool_path: string }[]
  return rows.map((r) => r.tool_path)
}

export function addFavourite(toolPath: string): void {
  db.prepare('INSERT OR IGNORE INTO favourites (tool_path) VALUES (?)').run(toolPath)
}

export function removeFavourite(toolPath: string): void {
  db.prepare('DELETE FROM favourites WHERE tool_path = ?').run(toolPath)
}

export function closeDatabase(): void {
  db?.close()
}
