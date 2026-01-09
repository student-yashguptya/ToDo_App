/**
 * ⚠️ DEPRECATED TIMER SERVICE
 *
 * This file is kept ONLY for backward compatibility.
 * The real timer logic lives in:
 * → src/context/TaskContext.tsx
 *
 * ❌ Do NOT use this for task timing
 * ✅ Safe if accidentally imported
 */

let startedAt: number | null = null
let totalMs = 0
let onTick: ((ms: number) => void) | null = null
let onHalf: (() => void) | null = null
let onComplete: (() => void) | null = null
let halfTriggered = false
let rafId: number | null = null

export function startTimer(
  durationMinutes: number,
  tick: (ms: number) => void,
  half: () => void,
  complete: () => void
) {
  stopTimer()

  totalMs = durationMinutes * 60_000
  startedAt = Date.now()
  halfTriggered = false

  onTick = tick
  onHalf = half
  onComplete = complete

  // lightweight animation-frame loop (not authoritative)
  rafId = requestAnimationFrame(run)
}

export function pauseTimer() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

export function resumeTimer() {
  if (!rafId && startedAt) {
    rafId = requestAnimationFrame(run)
  }
}

export function stopTimer() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  startedAt = null
}

function run() {
  if (!startedAt) return

  const elapsed = Date.now() - startedAt
  const remainingMs = Math.max(totalMs - elapsed, 0)

  onTick?.(remainingMs)

  if (!halfTriggered && remainingMs <= totalMs / 2) {
    halfTriggered = true
    onHalf?.()
  }

  if (remainingMs <= 0) {
    stopTimer()
    onComplete?.()
    return
  }

  rafId = requestAnimationFrame(run)
}
