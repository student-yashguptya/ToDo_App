import { createClient } from '@libsql/client'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'todo.db')

// Ensure database directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Create database client
const db = createClient({
  url: `file:${dbPath}`,
})

// Initialize schema
async function initDatabase() {
  // Users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)

  // Tasks table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      category TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      remaining_ms INTEGER,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      started_at INTEGER,
      last_resumed_at INTEGER,
      exhausted_on TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // Subtasks table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `)

  // Focus history table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS focus_history (
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      seconds INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // Indexes
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, scheduled_date);
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_focus_user_date ON focus_history(user_id, date);
  `)

  console.log('✅ Database initialized')
}

// IMPORTANT: await init
await initDatabase()

export default db
