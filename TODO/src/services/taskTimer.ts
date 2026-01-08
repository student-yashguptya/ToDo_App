let interval: NodeJS.Timeout | null = null
let remainingMs = 0
let onTick: ((ms: number) => void) | null = null
let onHalf: (() => void) | null = null
let onComplete: (() => void) | null = null
let totalMs = 0
let halfTriggered = false

export function startTimer(
  durationMinutes: number,
  tick: (ms: number) => void,
  half: () => void,
  complete: () => void
) {
  stopTimer()

  totalMs = durationMinutes * 60 * 1000
  remainingMs = totalMs
  halfTriggered = false

  onTick = tick
  onHalf = half
  onComplete = complete

  interval = setInterval(run, 1000)
}

export function pauseTimer() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

export function resumeTimer() {
  if (!interval && remainingMs > 0) {
    interval = setInterval(run, 1000)
  }
}

export function stopTimer() {
  if (interval) clearInterval(interval)
  interval = null
  remainingMs = 0
}

function run() {
  remainingMs -= 1000

  onTick?.(remainingMs)

  if (!halfTriggered && remainingMs <= totalMs / 2) {
    halfTriggered = true
    onHalf?.()
  }

  if (remainingMs <= 0) {
    stopTimer()
    onComplete?.()
  }
}
