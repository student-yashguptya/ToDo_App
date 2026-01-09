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

  // added (non-breaking)
  remainingMs?: number
  running?: boolean
  startedAt?: number
}
