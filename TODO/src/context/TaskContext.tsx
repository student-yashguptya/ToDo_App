import { createContext, useContext, useEffect, useState } from 'react'
import { Task, SubTask } from '../types/task'
import { loadTasks, saveTasks } from '../storage/taskStorage'
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
} from '../services/taskTimer'
import { playAlarm } from '../services/alarmSound'
import AsyncStorage from '@react-native-async-storage/async-storage'

/* ================================
   Focus history storage
================================ */
const FOCUS_KEY = 'FOCUS_HISTORY'
type FocusHistory = Record<string, number> // YYYY-MM-DD -> seconds

const todayKey = () =>
  new Date().toISOString().slice(0, 10)

/* ================================
   Context types
================================ */
interface TaskContextValue {
  tasks: Task[]
  loading: boolean

  activeTaskId: string | null
  remainingMs: number
  paused: boolean
  focusedToday: number

  weeklyFocus: { date: string; seconds: number }[]

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

  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void

  reorderTasks: (next: Task[]) => void
  refresh: () => Promise<void>

  startTask: (task: Task) => void
  pauseTask: () => void
  resumeTask: () => void
  stopTask: () => void
}

const TaskContext = createContext<TaskContextValue | null>(null)

/* ================================
   Provider
================================ */
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [remainingMs, setRemainingMs] = useState(0)
  const [paused, setPaused] = useState(false)

  const [focusHistory, setFocusHistory] = useState<FocusHistory>({})

  /* ---------- helpers ---------- */

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

  const completeTaskById = (taskId: string) => {
    persist(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      )
    )
  }

  /* ---------- lifecycle ---------- */

  useEffect(() => {
    refresh()
    loadFocusHistory()
  }, [])

  const refresh = async () => {
    setLoading(true)
    const raw = await loadTasks()
    setTasks(normalize(raw))
    setLoading(false)
  }

  const loadFocusHistory = async () => {
    const raw = await AsyncStorage.getItem(FOCUS_KEY)
    setFocusHistory(raw ? JSON.parse(raw) : {})
  }

  const saveFocusHistory = async (next: FocusHistory) => {
    setFocusHistory(next)
    await AsyncStorage.setItem(FOCUS_KEY, JSON.stringify(next))
  }

  /* ---------- TIMER CONTROLS ---------- */

  const startTask = (task: Task) => {
    setActiveTaskId(task.id)
    setPaused(false)

    startTimer(
      task.durationMinutes,

      // tick (every second)
      ms => {
        setRemainingMs(ms)

        const key = todayKey()
        const next = {
          ...focusHistory,
          [key]: (focusHistory[key] ?? 0) + 1,
        }

        saveFocusHistory(next)
      },

      // half-time alarm
      async () => {
        await playAlarm()
      },

      // full-time alarm → auto complete
      async () => {
        await playAlarm()
        completeTaskById(task.id)
        setActiveTaskId(null)
        setRemainingMs(0)
      }
    )
  }

  const pauseTask = () => {
    pauseTimer()
    setPaused(true)
  }

  const resumeTask = () => {
    resumeTimer()
    setPaused(false)
  }

  const stopTask = () => {
    stopTimer()
    setActiveTaskId(null)
    setRemainingMs(0)
    setPaused(false)
  }

  /* ---------- TASKS ---------- */

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
    if (id === activeTaskId) stopTask()

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

  /* ---------- SUBTASKS ---------- */

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

        const updated = task.subtasks.map(st =>
          st.id === subtaskId
            ? { ...st, completed: !st.completed }
            : st
        )

        return {
          ...task,
          subtasks: updated,
          completed:
            updated.length > 0 &&
            updated.every(st => st.completed),
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
              subtasks: task.subtasks.filter(
                st => st.id !== subtaskId
              ),
            }
          : task
      )
    )
  }

  /* ---------- WEEKLY FOCUS ---------- */

  const weeklyFocus = (() => {
    const out = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)

      out.push({
        date: key,
        seconds: focusHistory[key] ?? 0,
      })
    }

    return out
  })()

  const focusedToday = focusHistory[todayKey()] ?? 0

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        activeTaskId,
        remainingMs,
        paused,
        focusedToday,
        weeklyFocus,
        startTask,
        pauseTask,
        resumeTask,
        stopTask,
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
