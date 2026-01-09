import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Task, SubTask, TaskCategory } from '../types/task'
import { loadTasks, saveTasks } from '../storage/taskStorage'
import { loadFocusHistory, saveFocusHistory } from '../storage/focusStorage'
import { playAlarm } from '../services/alarmSound'
import { generateId } from '../utils/id'

/* ================================
   Date helpers
================================ */
const todayKey = () => new Date().toISOString().slice(0, 10)
const tomorrowKey = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

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
    category: TaskCategory,
    subtasks?: SubTask[]
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

  /* ================================
     Focus tracking
  ================================ */
  const [focusHistory, setFocusHistory] =
    useState<Record<string, number>>({})
  const focusRef = useRef<Record<string, number>>({})
  const saveCounter = useRef(0)

  /* ================================
     Normalize (NO AUTO-COMPLETE)
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
        scheduledDate: task.scheduledDate ?? todayKey(),
        category: task.category ?? 'personal',
        exhaustedOn: task.exhaustedOn,

        subtasks: (task.subtasks ?? []).map(st => ({
          ...st,
          id: st.id || generateId(),
          completed: st.completed ?? false,
        })),
        remainingMs:
          task.remainingMs ?? task.durationMinutes * 60_000,

        status: task.status ?? 'PAUSED',
        completed: task.status === 'COMPLETED',
        running: task.status === 'RUNNING',
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

      const [rawTasks, focus] = await Promise.all([
        loadTasks(),
        loadFocusHistory(),
      ])

      const fixed = normalize(rawTasks)
      setTasks(fixed)
      await saveTasks(fixed)

      setFocusHistory(focus)
      focusRef.current = focus

      setLoading(false)
    }

    init()
  }, [])

  /* ================================
     REFRESH
  ================================ */
  const refresh = async () => {
    setRefreshing(true)
    const raw = await loadTasks()
    setTasks(normalize(raw))
    setRefreshing(false)
  }

  /* ================================
     TIMER LOOP (NO AUTO-COMPLETE)
  ================================ */
  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now()
      const today = todayKey()

      persist(prev =>
        prev.map(t => {
          if (
            t.status !== 'RUNNING' ||
            t.scheduledDate !== today
          )
            return t

          const elapsed = now - (t.lastResumedAt ?? now)
          const totalMs = t.durationMinutes * 60_000
          const prevRemaining = t.remainingMs ?? totalMs
          const nextRemaining = Math.max(
            prevRemaining - elapsed,
            0
          )

          // 🔔 50% alarm
          if (
            prevRemaining > totalMs / 2 &&
            nextRemaining <= totalMs / 2
          ) {
            playAlarm()
          }

          // 📊 focus
          focusRef.current[today] =
            (focusRef.current[today] ?? 0) +
            Math.floor(elapsed / 1000)

          saveCounter.current++
          if (saveCounter.current >= 10) {
            saveCounter.current = 0
            saveFocusHistory(focusRef.current)
            setFocusHistory({ ...focusRef.current })
          }

          // ⏰ TIMER FINISHED (NOT COMPLETED)
          if (nextRemaining === 0) {
            playAlarm()
            return {
              ...t,
              remainingMs: 0,
              status: 'PAUSED',
              running: false,
              exhaustedOn: today,
              lastResumedAt: undefined,
            }
          }

          return {
            ...t,
            remainingMs: nextRemaining,
            lastResumedAt: now,
          }
        })
      )
    }, 1000)

    return () => clearInterval(tick)
  }, [])





  /* ================================
     TIMER CONTROLS
  ================================ */
 const startTask = (task: Task) => {
  if (
    task.scheduledDate !== todayKey() ||
    (task.remainingMs ?? 0) === 0
  )
    return

  persist(prev =>
    prev.map(t =>
      t.id === task.id
        ? {
            ...t,
            status: 'RUNNING',
            running: true,
            lastResumedAt: Date.now(),
            startedAt: t.startedAt ?? Date.now(),
          }
        : {
            ...t,
            status:
              t.status === 'RUNNING' ? 'PAUSED' : t.status,
            running: false,
          }
    )
  )
}

  const pauseTask = (taskId: string) => {
    persist(prev =>
      prev.map(t =>
        t.id === taskId && t.status === 'RUNNING'
          ? {
              ...t,
              status: 'PAUSED',
              running: false,
              lastResumedAt: undefined,
            }
          : t
      )
    )
  }
 /* ================================
   MIDNIGHT ROLLOVER (EXHAUSTED TASKS)
================================ */
useEffect(() => {
  const interval = setInterval(() => {
    const today = todayKey()
    const tomorrow = tomorrowKey()

    persist(prev =>
      prev.map(t => {
        // Completed tasks NEVER move
        if (t.status === 'COMPLETED') return t

        // Move only exhausted tasks from previous day
        if (
          t.exhaustedOn &&
          t.exhaustedOn < today
        ) {
          return {
            ...t,
            scheduledDate: tomorrow,
            exhaustedOn: undefined, // reset
          }
        }

        return t
      })
    )
  }, 60_000)

  return () => clearInterval(interval)
}, [])



const resumeTask = (taskId: string) => {
  const task = tasks.find(t => t.id === taskId)
  if (
    task &&
    task.status !== 'COMPLETED' &&
    (task.remainingMs ?? 0) > 0 &&
    task.scheduledDate === todayKey()
  ) {
    startTask(task)
  }
}

  const stopTask = (taskId: string) => {
    pauseTask(taskId)
    persist(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              remainingMs: t.durationMinutes * 60_000,
            }
          : t
      )
    )
  }

  /* ================================
     CRUD
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
        category,
        subtasks,
        scheduledDate: scheduledDate ?? todayKey(),
        remainingMs: duration * 60_000,
        status: 'PAUSED',
        running: false,
        completed: false,
      },
      ...prev,
    ])
  }

const updateTask = (
  id: string,
  title: string,
  duration: number,
  category: TaskCategory,
  subtasks?: SubTask[]
) => {
  persist(prev =>
    prev.map(t =>
      t.id === id && t.status !== 'COMPLETED'
        ? {
            ...t,
            title,
            durationMinutes: duration,
            category,
            subtasks: subtasks ?? t.subtasks,
          }
        : t
    )
  )
}


  const toggleTask = (id: string) => {
    persist(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              status: 'COMPLETED',
              completed: true,
              running: false,
              remainingMs: 0,
            }
          : t
      )
    )
  }

  const deleteTask = (id: string) => {
    persist(prev => prev.filter(t => t.id !== id))
  }

  const reorderTasks = (next: Task[]) => persist(() => next)

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

  const recalcTaskCompletion = (task: Task): Task => {
  if (task.subtasks.length === 0) return task

  const allDone = task.subtasks.every(st => st.completed)

  if (allDone && task.status !== 'COMPLETED') {
    return {
      ...task,
      status: 'COMPLETED',
      completed: true,
      running: false,
      remainingMs: 0,
    }
  }

  return task
}


const toggleSubtask = (taskId: string, subtaskId: string) => {
  persist(prev =>
    prev.map(task => {
      if (task.id !== taskId) return task

      const subtasks = task.subtasks.map(st =>
        st.id === subtaskId
          ? { ...st, completed: !st.completed }
          : st
      )

      return recalcTaskCompletion({
        ...task,
        subtasks,
      })
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
  if (!ctx)
    throw new Error('useTasks must be used inside TaskProvider')
  return ctx
}
