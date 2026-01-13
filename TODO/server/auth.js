import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import db from './database.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// --------------------
// JWT helpers
// --------------------
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '365d' })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// --------------------
// Register user
// --------------------
async function registerUser(username, password) {
  const userId = uuidv4()
  const passwordHash = await bcrypt.hash(password, 10)
  const createdAt = Date.now()

  try {
    await db.run(
      `INSERT INTO users (id, username, password_hash, created_at)
       VALUES (?, ?, ?, ?)`,
      [userId, username, passwordHash, createdAt]
    )

    const token = generateToken(userId)
    return { success: true, token, userId }
  } catch (error) {
    if (error.message?.includes('UNIQUE')) {
      return { success: false, error: 'Username already exists' }
    }

    console.error('REGISTER ERROR:', error)
    return { success: false, error: 'Registration failed' }
  }
}

// --------------------
// Login user
// --------------------
async function loginUser(username, password) {
  const user = await db.get(
    `SELECT id, password_hash FROM users WHERE username = ?`,
    [username]
  )

  if (!user) {
    return { success: false, error: 'Invalid credentials' }
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatch) {
    return { success: false, error: 'Invalid credentials' }
  }

  const token = generateToken(user.id)
  return { success: true, token, userId: user.id }
}

// --------------------
// Auth middleware
// --------------------
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.slice(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.userId = decoded.userId
  next()
}

export {
  registerUser,
  loginUser,
  authenticate,
}
