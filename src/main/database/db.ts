import { app } from 'electron'
import { join } from 'path'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs'

// sql.js is a pure-JS WebAssembly port of SQLite — no native compilation needed
let SQL: typeof import('sql.js').default
let db: import('sql.js').Database | null = null

async function loadSQL(): Promise<typeof import('sql.js').default> {
  if (SQL) return SQL
  const initSqlJs = require('sql.js')
  SQL = await initSqlJs({
    locateFile: (file: string) => {
      // In packaged app, use resource path
      if (app.isPackaged) {
        return join(process.resourcesPath, 'sql-wasm.wasm')
      }
      return join(__dirname, '../../../node_modules/sql.js/dist/', file)
    }
  })
  return SQL
}

let dbPath: string
let saveTimer: NodeJS.Timeout | null = null

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (db) {
      const data = db.export()
      writeFileSync(dbPath, Buffer.from(data))
    }
  }, 500)
}

export async function initDatabase(): Promise<void> {
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'viviw')
  mkdirSync(dbDir, { recursive: true })
  dbPath = join(dbDir, 'viviw.db')

  const SQL = await loadSQL()

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')),
      resume_path TEXT,
      context_docs TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      stt_latency_ms INTEGER DEFAULT 0,
      ai_latency_ms INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS uploaded_files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      size INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  scheduleSave()
  console.log('[DB] Database initialized at', dbPath)
}

function getDb(): import('sql.js').Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

// Settings operations
export function getSetting(key: string): string | null {
  const result = getDb().exec('SELECT value FROM settings WHERE key = ?', [key])
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0] as string
  }
  return null
}

export function setSetting(key: string, value: string): void {
  getDb().run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value])
  scheduleSave()
}

// Session operations
export function createSession(id: string): void {
  getDb().run('INSERT OR IGNORE INTO sessions (id) VALUES (?)', [id])
  scheduleSave()
}

// Conversation operations
export function saveConversation(
  sessionId: string,
  question: string,
  answer: string,
  sttLatencyMs: number,
  aiLatencyMs: number
): void {
  getDb().run(
    'INSERT INTO conversations (session_id, question, answer, stt_latency_ms, ai_latency_ms) VALUES (?, ?, ?, ?, ?)',
    [sessionId, question, answer, sttLatencyMs, aiLatencyMs]
  )
  scheduleSave()
}

export function getConversations(sessionId: string, limit = 10): unknown[] {
  const result = getDb().exec(
    'SELECT id, session_id, question, answer, stt_latency_ms, ai_latency_ms, created_at FROM conversations WHERE session_id = ? ORDER BY created_at DESC LIMIT ?',
    [sessionId, limit]
  )
  if (!result.length) return []
  const [{ columns, values }] = result
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  )
}

export function clearAllConversations(): void {
  getDb().run('DELETE FROM conversations')
  scheduleSave()
}

// Uploaded files
export function saveUploadedFile(file: {
  id: string
  name: string
  type: string
  path: string
  size: number
}): void {
  getDb().run(
    'INSERT OR REPLACE INTO uploaded_files (id, name, type, path, size) VALUES (?, ?, ?, ?, ?)',
    [file.id, file.name, file.type, file.path, file.size]
  )
  scheduleSave()
}

export function getUploadedFiles(): unknown[] {
  const result = getDb().exec(
    'SELECT id, name, type, path, size, created_at FROM uploaded_files ORDER BY created_at DESC'
  )
  if (!result.length) return []
  const [{ columns, values }] = result
  return values.map((row) => Object.fromEntries(columns.map((col, i) => [col, row[i]])))
}

export function removeUploadedFile(id: string): void {
  getDb().run('DELETE FROM uploaded_files WHERE id = ?', [id])
  scheduleSave()
}
