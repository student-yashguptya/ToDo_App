export type TaskCategory =
  | 'personal'
  | 'professional'
  | 'study'

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
  durationMinutes: number
  subtasks: SubTask[]
  category: TaskCategory
  scheduledDate: string // YYYY-MM-DD

  /* ================================
     TIMER STATE
  ================================ */
  remainingMs?: number
  running?: boolean
  startedAt?: number
  lastResumedAt?: number

  /* ================================
     STATUS
  ================================ */
  status?: 'PAUSED' | 'RUNNING' | 'COMPLETED'

  /* ================================
     🔑 EXHAUSTION TRACKING (NEW)
     DO NOT REMOVE
  ================================ */
  exhaustedOn?: string // YYYY-MM-DD
}
