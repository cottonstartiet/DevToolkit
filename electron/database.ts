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

export function closeDatabase(): void {
  db?.close()
}
