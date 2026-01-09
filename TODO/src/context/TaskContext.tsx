import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Task, SubTask, TaskCategory ,} from '../types/task'
import { loadTasks, saveTasks } from '../storage/taskStorage'
import { playAlarm } from '../services/alarmSound'
import { generateId } from '../utils/id'

/* ================================
   Focus history
================================ */
const FOCUS_KEY = 'FOCUS_HISTORY'
type FocusHistory = Record<string, number>

const todayKey = () => new Date().toISOString().slice(0, 10)

/* ================================
   Context
================================ */
interface TaskContextValue {
  tasks: Task[]
  loading: boolean
  refreshing: boolean

  focusedToday: number
  weeklyFocus: { date: string; seconds: number }[]

addTask: (
  title: string,
  duration: number,
  category: TaskCategory,
  subtasks?: SubTask[],
  scheduledDate?: string
) => void


  updateTask: (
    id: string,
    title: string,
    duration: number,
    category: TaskCategory
  ) => void

  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void

  reorderTasks: (next: Task[]) => void
  refresh: () => Promise<void>

  startTask: (task: Task) => void
  pauseTask: (taskId: string) => void
  resumeTask: (taskId: string) => void
  stopTask: (taskId: string) => void
}

const TaskContext = createContext<TaskContextValue | null>(null)

/* ================================
   Provider
================================ */
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const timers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  const [focusHistory, setFocusHistory] = useState<FocusHistory>({})
  const focusRef = useRef<FocusHistory>({})
  const saveCounter = useRef(0)

  /* ================================
     NORMALIZE (📅 ADD DAY SUPPORT)
  ================================ */
  const normalize = (raw: Task[]): Task[] => {
    const seen = new Set<string>()

    return raw.map(task => {
      let id = task.id
      if (!id || seen.has(id)) id = generateId()
      seen.add(id)

      return {
        ...task,
        id,
        scheduledDate: task.scheduledDate ?? todayKey(), // 📅 NEW
        subtasks: (task.subtasks ?? []).map(st => ({
          ...st,
          id: st.id || generateId(),
        })),
        category: task.category ?? 'personal',
        remainingMs:
          task.remainingMs ?? task.durationMinutes * 60_000,
        running: false,
        completed: task.completed ?? false,
      }
    })
  }

  const persist = (updater: (prev: Task[]) => Task[]) => {
    setTasks(prev => {
      const next = updater(prev)
      saveTasks(next).catch(console.error)
      return next
    })
  }

  /* ================================
     LOAD
  ================================ */
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const raw = await loadTasks()
      const fixed = normalize(raw)
      setTasks(fixed)
      await saveTasks(fixed)
      setLoading(false)
    }

    init()
    loadFocusHistory()

    return () => {
      timers.current.forEach(clearInterval)
      timers.current.clear()
    }
  }, [])

  const refresh = async () => {
    setRefreshing(true)
    const raw = await loadTasks()
    setTasks(normalize(raw))
    setRefreshing(false)
  }

  /* ================================
     FOCUS
  ================================ */
  const loadFocusHistory = async () => {
    const raw = await AsyncStorage.getItem(FOCUS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    setFocusHistory(parsed)
    focusRef.current = parsed
  }

  const persistFocusHistory = async () => {
    await AsyncStorage.setItem(
      FOCUS_KEY,
      JSON.stringify(focusRef.current)
    )
  }

  /* ================================
     TIMER + AUTO-NEXT (SAME DAY)
  ================================ */
  const startTask = (task: Task) => {
    if (timers.current.has(task.id)) return

    persist(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, running: true } : t
      )
    )

    const totalMs = task.durationMinutes * 60_000
    const halfPoint = totalMs / 2

    const interval = setInterval(() => {
      setTasks(prev =>
        prev.map(t => {
          if (t.id !== task.id) return t

          const nextMs = (t.remainingMs ?? totalMs) - 1000

          const key = todayKey()
          focusRef.current[key] =
            (focusRef.current[key] ?? 0) + 1

          saveCounter.current++
          if (saveCounter.current >= 10) {
            saveCounter.current = 0
            persistFocusHistory()
            setFocusHistory({ ...focusRef.current })
          }

          if (
            t.remainingMs &&
            t.remainingMs > halfPoint &&
            nextMs <= halfPoint
          ) {
            playAlarm()
          }

          if (nextMs <= 0) {
            clearInterval(interval)
            timers.current.delete(task.id)
            playAlarm()

            // ⏭ AUTO-START NEXT TASK (SAME DAY ONLY)
            setTimeout(() => {
              setTasks(prevTasks => {
                const index = prevTasks.findIndex(x => x.id === task.id)

                const nextTask = prevTasks
                  .slice(index + 1)
                  .find(
                    t =>
                      !t.completed &&
                      !t.running &&
                      t.scheduledDate === task.scheduledDate
                  )

                if (nextTask) startTask(nextTask)
                return prevTasks
              })
            }, 300)

            return {
              ...t,
              remainingMs: 0,
              completed: true,
              running: false,
            }
          }

          return { ...t, remainingMs: nextMs }
        })
      )
    }, 1000)

    timers.current.set(task.id, interval)
  }

  const pauseTask = (taskId: string) => {
    const timer = timers.current.get(taskId)
    if (!timer) return
    clearInterval(timer)
    timers.current.delete(taskId)

    persist(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, running: false } : t
      )
    )
  }

  const resumeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && !task.completed) startTask(task)
  }

  const stopTask = (taskId: string) => {
    const timer = timers.current.get(taskId)
    if (timer) {
      clearInterval(timer)
      timers.current.delete(taskId)
    }

    persist(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              running: false,
              remainingMs: t.durationMinutes * 60_000,
            }
          : t
      )
    )
  }

  /* ================================
     TASK CRUD
  ================================ */
 const addTask = (
  title: string,
  duration: number,
  category: TaskCategory,
  subtasks: SubTask[] = [],
  scheduledDate?: string
) => {
  persist(prev => [
    {
      id: generateId(),
      title,
      durationMinutes: duration,
      createdAt: Date.now(),
      completed: false,
      category,
      subtasks: subtasks.map(st => ({
        ...st,
        id: st.id || generateId(),
      })),
      scheduledDate: scheduledDate ?? todayKey(), // ✅ SINGLE SOURCE OF TRUTH
      remainingMs: duration * 60_000,
      running: false,
    },
    ...prev,
  ])
}


  const updateTask = (
    id: string,
    title: string,
    duration: number,
    category: TaskCategory
  ) => {
    persist(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              title,
              durationMinutes: duration,
              category,
              remainingMs: duration * 60_000,
            }
          : t
      )
    )
  }

 const toggleTask = (id: string) => {
  persist(prev =>
    prev.map(t => {
      if (t.id !== id) return t

      // ⏳ If unfinished → move to tomorrow
      if (!t.completed && (t.remainingMs ?? 0) > 0) {
        return {
          ...t,
          scheduledDate: tomorrowKey(), // 📅 move
          remainingMs: t.durationMinutes * 60_000, // reset
          running: false,
          completed: false,
        }
      }

      // ✅ Fully completed
      return {
        ...t,
        completed: true,
        running: false,
        remainingMs: 0,
      }
    })
  )
}


  const deleteTask = (id: string) => {
    stopTask(id)
    persist(prev => prev.filter(t => t.id !== id))
  }

  const reorderTasks = (next: Task[]) => persist(() => next)

  const tomorrowKey = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

  /* ================================
     SUBTASKS
  ================================ */
  const addSubtask = (taskId: string, title: string) => {
    persist(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                { id: generateId(), title, completed: false },
              ],
            }
          : t
      )
    )
  }

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    persist(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t

        const subtasks = t.subtasks.map(st =>
          st.id === subtaskId
            ? { ...st, completed: !st.completed }
            : st
        )

        return {
          ...t,
          subtasks,
          completed: subtasks.every(st => st.completed),
        }
      })
    )
  }

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    persist(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.filter(st => st.id !== subtaskId),
            }
          : t
      )
    )
  }

  /* ================================
     STATS
  ================================ */
  const weeklyFocus = useMemo(() => {
    const out = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      out.push({ date: key, seconds: focusHistory[key] ?? 0 })
    }

    return out
  }, [focusHistory])

  const focusedToday = focusHistory[todayKey()] ?? 0

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        refreshing,
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
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider')
  return ctx
}
