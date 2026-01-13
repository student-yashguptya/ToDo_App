import { v4 as uuidv4 } from 'uuid'
import db from './database.js'

// --------------------
// Helpers
// --------------------
function mapTask(task, subtasks = []) {
  return {
    id: task.id,
    title: task.title,
    completed: task.status === 'COMPLETED',
    createdAt: task.created_at,
    durationMinutes: task.duration_minutes,
    category: task.category,
    scheduledDate: task.scheduled_date,
    remainingMs: task.remaining_ms ?? task.duration_minutes * 60000,
    status: task.status,
    running: task.status === 'RUNNING',
    startedAt: task.started_at,
    lastResumedAt: task.last_resumed_at,
    exhaustedOn: task.exhausted_on,
    subtasks,
  }
}

// --------------------
// Get all tasks
// --------------------
async function getUserTasks(userId, scheduledDate = null) {
  let sql = `SELECT * FROM tasks WHERE user_id = ?`
  const params = [userId]

  if (scheduledDate) {
    sql += ` AND scheduled_date = ?`
    params.push(scheduledDate)
  }

  sql += ` ORDER BY created_at DESC`

  const tasks = await db.all(sql, params)

  const result = []
  for (const task of tasks) {
    const subtasks = await db.all(
      `SELECT id, title, completed FROM subtasks WHERE task_id = ?`,
      [task.id]
    )

    result.push(
      mapTask(
        task,
        subtasks.map(s => ({
          id: s.id,
          title: s.title,
          completed: Boolean(s.completed),
        }))
      )
    )
  }

  return result
}

// --------------------
// Get single task
// --------------------
async function getTask(userId, taskId) {
  const task = await db.get(
    `SELECT * FROM tasks WHERE id = ? AND user_id = ?`,
    [taskId, userId]
  )

  if (!task) return null

  const subtasks = await db.all(
    `SELECT id, title, completed FROM subtasks WHERE task_id = ?`,
    [taskId]
  )

  return mapTask(
    task,
    subtasks.map(s => ({
      id: s.id,
      title: s.title,
      completed: Boolean(s.completed),
    }))
  )
}

// --------------------
// Create task
// --------------------
async function createTask(userId, data) {
  const taskId = uuidv4()
  const now = Date.now()

  await db.run(
    `INSERT INTO tasks (
      id, user_id, title, duration_minutes, category,
      scheduled_date, remaining_ms, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taskId,
      userId,
      data.title,
      data.durationMinutes,
      data.category,
      data.scheduledDate,
      data.durationMinutes * 60000,
      'PAUSED',
      now,
    ]
  )

  if (data.subtasks?.length) {
    for (const st of data.subtasks) {
      await db.run(
        `INSERT INTO subtasks (id, task_id, title, completed)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), taskId, st.title, st.completed ? 1 : 0]
      )
    }
  }

  return getTask(userId, taskId)
}

// --------------------
// Update task
// --------------------
async function updateTask(userId, taskId, data) {
  const existing = await getTask(userId, taskId)
  if (!existing || existing.status === 'COMPLETED') return null

  await db.run(
    `UPDATE tasks SET title = ?, duration_minutes = ?, category = ?
     WHERE id = ? AND user_id = ?`,
    [
      data.title,
      data.durationMinutes,
      data.category,
      taskId,
      userId,
    ]
  )

  if (Array.isArray(data.subtasks)) {
    await db.run(`DELETE FROM subtasks WHERE task_id = ?`, [taskId])

    for (const st of data.subtasks) {
      await db.run(
        `INSERT INTO subtasks (id, task_id, title, completed)
         VALUES (?, ?, ?, ?)`,
        [st.id || uuidv4(), taskId, st.title, st.completed ? 1 : 0]
      )
    }
  }

  return getTask(userId, taskId)
}

// --------------------
// Delete task
// --------------------
async function deleteTask(userId, taskId) {
  const result = await db.run(
    `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
    [taskId, userId]
  )
  return result.changes > 0
}

// --------------------
// Toggle task completion
// --------------------
async function toggleTask(userId, taskId) {
  const task = await getTask(userId, taskId)
  if (!task) return null

  const status = task.status === 'COMPLETED' ? 'PAUSED' : 'COMPLETED'
  const remainingMs = status === 'COMPLETED' ? 0 : task.durationMinutes * 60000

  await db.run(
    `UPDATE tasks SET status = 'PAUSED', last_resumed_at = NULL
     WHERE user_id = ? AND status = 'RUNNING'`,
    [userId]
  )
  

  return getTask(userId, taskId)
}

// --------------------
// Start / pause task
// --------------------
async function startTask(userId, taskId) {
  const task = await getTask(userId, taskId)
  if (!task || task.status === 'COMPLETED' || task.remainingMs === 0) return null

  const now = Date.now()

  await db.run(
    `UPDATE tasks SET status = 'PAUSED', last_resumed_at = NULL
     WHERE user_id = ? AND status = 'RUNNING' AND id != ?`,
    [userId, taskId]
  )

  await db.run(
    `UPDATE tasks SET status = 'RUNNING',
     started_at = COALESCE(started_at, ?),
     last_resumed_at = ?
     WHERE id = ? AND user_id = ?`,
    [now, now, taskId, userId]
  )

  return getTask(userId, taskId)
}

async function pauseTask(userId, taskId) {
  await db.run(
    `UPDATE tasks SET status = 'PAUSED', last_resumed_at = NULL
     WHERE id = ? AND user_id = ?`,
    [taskId, userId]
  )
  return getTask(userId, taskId)
}

// --------------------
// Timer updates
// --------------------
async function updateTaskTimer(userId, taskId, updates) {
  const fields = []
  const values = []

  for (const [key, col] of [
    ['remainingMs', 'remaining_ms'],
    ['status', 'status'],
    ['lastResumedAt', 'last_resumed_at'],
    ['exhaustedOn', 'exhausted_on'],
  ]) {
    if (updates[key] !== undefined) {
      fields.push(`${col} = ?`)
      values.push(updates[key])
    }
  }

  if (!fields.length) return getTask(userId, taskId)

  values.push(taskId, userId)
  await db.run(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  )

  return getTask(userId, taskId)
}

// --------------------
// Subtasks
// --------------------
async function addSubtask(userId, taskId, title) {
  const task = await getTask(userId, taskId)
  if (!task) return null

  await db.run(
    `INSERT INTO subtasks (id, task_id, title, completed)
     VALUES (?, ?, ?, 0)`,
    [uuidv4(), taskId, title]
  )

  return getTask(userId, taskId)
}

async function toggleSubtask(userId, taskId, subtaskId) {
  await db.run(
    `UPDATE subtasks SET completed = NOT completed
     WHERE id = ? AND task_id = ?`,
    [subtaskId, taskId]
  )

  return getTask(userId, taskId)
}

async function deleteSubtask(userId, taskId, subtaskId) {
  await db.run(
    `DELETE FROM subtasks WHERE id = ? AND task_id = ?`,
    [subtaskId, taskId]
  )

  return getTask(userId, taskId)
}

// --------------------
// Reorder
// --------------------
async function reorderTasks(userId, taskIds) {
  const now = Date.now()
  for (let i = 0; i < taskIds.length; i++) {
    await db.run(
      `UPDATE tasks SET created_at = ? WHERE id = ? AND user_id = ?`,
      [now + i, taskIds[i], userId]
    )
  }
  return getUserTasks(userId)
}

export {
  getUserTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  startTask,
  pauseTask,
  updateTaskTimer,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  reorderTasks,
}
