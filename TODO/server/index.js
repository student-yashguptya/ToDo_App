import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { authenticate, registerUser, loginUser } from './auth.js'
import * as tasks from './tasks.js'
import * as focus from './focus.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// --------------------
// Health
// --------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// --------------------
// Auth
// --------------------
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const result = await registerUser(username, password)
  if (!result.success) {
    return res.status(400).json({ error: result.error })
  }

  res.json(result)
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const result = await loginUser(username, password)
  if (!result.success) {
    return res.status(401).json({ error: result.error })
  }

  res.json(result)
})

// --------------------
// Tasks
// --------------------
app.get('/api/tasks', authenticate, async (req, res) => {
  const { scheduledDate } = req.query
  res.json(await tasks.getUserTasks(req.userId, scheduledDate))
})

app.get('/api/tasks/:id', authenticate, async (req, res) => {
  const task = await tasks.getTask(req.userId, req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
})

app.post('/api/tasks', authenticate, async (req, res) => {
  const task = await tasks.createTask(req.userId, req.body)
  res.status(201).json(task)
})

app.put('/api/tasks/:id', authenticate, async (req, res) => {
  const task = await tasks.updateTask(req.userId, req.params.id, req.body)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
})

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  await tasks.deleteTask(req.userId, req.params.id)
  res.status(204).send()
})

app.post('/api/tasks/:id/toggle', authenticate, async (req, res) => {
  res.json(await tasks.toggleTask(req.userId, req.params.id))
})

app.post('/api/tasks/:id/start', authenticate, async (req, res) => {
  res.json(await tasks.startTask(req.userId, req.params.id))
})

app.post('/api/tasks/:id/pause', authenticate, async (req, res) => {
  res.json(await tasks.pauseTask(req.userId, req.params.id))
})

app.put('/api/tasks/:id/timer', authenticate, async (req, res) => {
  res.json(await tasks.updateTaskTimer(req.userId, req.params.id, req.body))
})

app.put('/api/tasks/reorder', authenticate, async (req, res) => {
  res.json(await tasks.reorderTasks(req.userId, req.body.taskIds))
})

// --------------------
// Focus
// --------------------
app.get('/api/focus', authenticate, async (req, res) => {
  res.json(await focus.getFocusHistory(req.userId, req.query.date))
})

app.put('/api/focus', authenticate, async (req, res) => {
  const { date, seconds } = req.body
  await focus.updateFocus(req.userId, date, seconds)
  res.json({ success: true })
})

// --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
