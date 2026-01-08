import { createContext, useContext, useEffect, useState } from 'react'
import { Task, SubTask } from '../types/task'
import { loadTasks, saveTasks } from '../storage/taskStorage'

interface TaskContextValue {
  tasks: Task[]
  loading: boolean

  addTask: (
    title: string,
    duration: number,
    category?: string,
    subtasks?: SubTask[]
  ) => void

  updateTask: (
    id: string,
    title: string,
    duration: number,
    category?: string
  ) => void

  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  // Subtasks
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void

  reorderTasks: (next: Task[]) => void
  refresh: () => Promise<void>
}

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // ---------- helpers ----------

  const normalize = (raw: Task[]): Task[] =>
    raw.map(t => ({
      ...t,
      subtasks: t.subtasks ?? [],
      category: t.category ?? 'default',
    }))

  const persist = async (updater: (prev: Task[]) => Task[]) => {
    setTasks(prev => {
      const next = updater(prev)
      saveTasks(next)
      return next
    })
  }

  // ---------- lifecycle ----------

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    setLoading(true)
    const raw = await loadTasks()
    setTasks(normalize(raw))
    setLoading(false)
  }

  // ---------- TASKS ----------

  const addTask = (
    title: string,
    duration: number,
    category = 'default',
    subtasks: SubTask[] = []
  ) => {
    persist(prev => [
      {
        id: Date.now().toString(),
        title,
        durationMinutes: duration,
        completed: false,
        createdAt: Date.now(),
        subtasks,
        category,
      },
      ...prev,
    ])
  }

  const updateTask = (
    id: string,
    title: string,
    duration: number,
    category = 'default'
  ) => {
    persist(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, title, durationMinutes: duration, category }
          : t
      )
    )
  }

  const toggleTask = (id: string) => {
    persist(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    )
  }

  const deleteTask = (id: string) => {
    persist(prev => prev.filter(t => t.id !== id))
  }

  const reorderTasks = (next: Task[]) => {
    persist(() => next)
  }

  // ---------- SUBTASKS ----------

  const addSubtask = (taskId: string, title: string) => {
    persist(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...task.subtasks,
                {
                  id: Date.now().toString(),
                  title,
                  completed: false,
                },
              ],
            }
          : task
      )
    )
  }

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    persist(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task

        const updatedSubtasks = task.subtasks.map(st =>
          st.id === subtaskId
            ? { ...st, completed: !st.completed }
            : st
        )

        const allDone =
          updatedSubtasks.length > 0 &&
          updatedSubtasks.every(st => st.completed)

        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allDone ? true : task.completed,
        }
      })
    )
  }

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    persist(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter(st => st.id !== subtaskId),
            }
          : task
      )
    )
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        reorderTasks,
        refresh,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) {
    throw new Error('useTasks must be used inside TaskProvider')
  }
  return ctx
}
