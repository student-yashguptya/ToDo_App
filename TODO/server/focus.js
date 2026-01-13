import db from './database.js'

// --------------------
// Get focus history
// --------------------
async function getFocusHistory(userId, date = null) {
  let sql = `SELECT date, seconds FROM focus_history WHERE user_id = ?`
  const params = [userId]

  if (date) {
    sql += ` AND date = ?`
    params.push(date)
  }

  sql += ` ORDER BY date DESC`

  const rows = await db.all(sql, params)

  const result = {}
  for (const row of rows) {
    result[row.date] = row.seconds
  }

  return result
}

// --------------------
// Set focus seconds
// --------------------
async function updateFocus(userId, date, seconds) {
  await db.run(
    `INSERT INTO focus_history (user_id, date, seconds)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, date)
     DO UPDATE SET seconds = excluded.seconds`,
    [userId, date, seconds]
  )
}

// --------------------
// Increment focus seconds
// --------------------
async function incrementFocus(userId, date, additionalSeconds) {
  const row = await db.get(
    `SELECT seconds FROM focus_history WHERE user_id = ? AND date = ?`,
    [userId, date]
  )

  const newSeconds = (row?.seconds || 0) + additionalSeconds
  await updateFocus(userId, date, newSeconds)

  return newSeconds
}

export {
  getFocusHistory,
  updateFocus,
  incrementFocus,
}
