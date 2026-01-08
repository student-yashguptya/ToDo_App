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
  category: string

}
