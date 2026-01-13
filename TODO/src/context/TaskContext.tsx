import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Task, SubTask, TaskCategory } from '../types/task'
import { tasksApi, focusApi } from '../services/api'
import { playAlarm } from '../services/alarmSound'
import { generateId } from '../utils/id'
import { getStoredToken } from '../services/api'


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
     Normalize tasks from API
  ================================ */
  const normalize = (raw: any[]): Task[] => {
    return raw.map(task => ({
      id: task.id,
      title: task.title,
      completed: task.completed ?? task.status === 'COMPLETED',
      createdAt: task.createdAt,
      durationMinutes: task.durationMinutes,
      subtasks: (task.subtasks ?? []).map((st: any) => ({
        id: st.id,
        title: st.title,
        completed: st.completed ?? false,
      })),
      category: task.category ?? 'personal',
      scheduledDate: task.scheduledDate ?? todayKey(),
      remainingMs: task.remainingMs ?? task.durationMinutes * 60_000,
      status: task.status ?? 'PAUSED',
      running: task.running ?? task.status === 'RUNNING',
      startedAt: task.startedAt,
      lastResumedAt: task.lastResumedAt,
      exhaustedOn: task.exhaustedOn,
    }))
  }

  /* ================================
     LOAD
  ================================ */
useEffect(() => {
  let mounted = true

  const init = async () => {
    setLoading(true)

    try {
      const token = await getStoredToken()
      if (!token) {
        setTasks([])
        setLoading(false)
        return
      }

      const [rawTasks, focus] = await Promise.all([
        tasksApi.getTasks(),
        focusApi.getFocusHistory(),
      ])

      if (!mounted) return

      setTasks(normalize(rawTasks))
      setFocusHistory(focus)
      focusRef.current = focus
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      if (mounted) setLoading(false)
    }
  }

  init()
  return () => {
    mounted = false
  }
}, [])


  /* ================================
     REFRESH
  ================================ */
  const refresh = async () => {
    setRefreshing(true)
    try {
      const raw = await tasksApi.getTasks()
      setTasks(normalize(raw))
    } catch (error) {
      console.error('Failed to refresh tasks:', error)
    } finally {
      setRefreshing(false)
    }
  }

  /* ================================
     TIMER LOOP (NO AUTO-COMPLETE)
  ================================ */
  const timerSyncRef = useRef<Map<string, number>>(new Map())
  useEffect(() => {
    const tick = setInterval(async () => {
      const now = Date.now()
      const today = todayKey()

      setTasks(prev =>
        prev.map(t => {
          if (
  t.status !== 'RUNNING' ||
  t.scheduledDate !== today ||
  t.exhaustedOn === today
) {
  return t
}


          const elapsed = 1000
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
            (focusRef.current[today] ?? 0) +1

          saveCounter.current++
          if (saveCounter.current >= 10) {
            saveCounter.current = 0
            focusApi.updateFocus(today, focusRef.current[today] ?? 0).catch(console.error)
            setFocusHistory({ ...focusRef.current })
          }

          // ⏰ TIMER FINISHED (NOT COMPLETED)
          if (nextRemaining === 0) {
            playAlarm()
            tasksApi.updateTaskTimer(t.id, {
              remainingMs: 0,
              status: 'PAUSED',
              exhaustedOn: today,
              lastResumedAt: undefined,
            }).catch(console.error)
            
            return {
              ...t,
              remainingMs: 0,
              status: 'PAUSED',
              running: false,
              exhaustedOn: today,
              
            }
          }

          // Sync with backend every 5 seconds
          const lastSync = timerSyncRef.current.get(t.id) ?? 0
          if (now - lastSync > 5000) {
            timerSyncRef.current.set(t.id, now)
            tasksApi.updateTaskTimer(t.id, {
              remainingMs: nextRemaining,
              lastResumedAt: now,
            }).catch(console.error)
          }

          return {
            ...t,
            remainingMs: nextRemaining,
            
          }
        })
      )
    }, 1000)

    return () => clearInterval(tick)
  }, [])





  /* ================================
     TIMER CONTROLS
  ================================ */
  const startTask = async (task: Task) => {
    if (
      task.scheduledDate !== todayKey() ||
      (task.remainingMs ?? 0) === 0
    )
      return

    try {
      const updated = await tasksApi.startTask(task.id)
      setTasks(prev =>
        prev.map(t => {
          if (t.id === task.id) {
            return normalize([updated])[0]
          }
          if (t.status === 'RUNNING') {
            return { ...t, status: 'PAUSED', running: false }
          }
          return t
        })
      )
    } catch (error) {
      console.error('Failed to start task:', error)
    }
  }

  const pauseTask = async (taskId: string) => {
    try {
      const updated = await tasksApi.pauseTask(taskId)
      if (updated) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? normalize([updated])[0] : t))
        )
      }
    } catch (error) {
      console.error('Failed to pause task:', error)
    }
  }
  /* ================================
     MIDNIGHT ROLLOVER (EXHAUSTED TASKS)
  ================================ */
  useEffect(() => {
    const interval = setInterval(async () => {
      const today = todayKey()
      const tomorrow = tomorrowKey()

      setTasks(prev => {
        const updates: Promise<any>[] = []
        const next = prev.map(t => {
          // Completed tasks NEVER move
          if (t.status === 'COMPLETED') return t

          // Move only exhausted tasks from previous day
          if (t.exhaustedOn && t.exhaustedOn < today) {
            // Note: Backend update would require task update endpoint
            // For now, handle in frontend - backend sync happens on refresh
            return {
              ...t,
              scheduledDate: tomorrow,
              exhaustedOn: undefined,
            }
          }

          return t
        })
        return next
      })
    }, 60_000)

    return () => clearInterval(interval)
  }, [])



  const resumeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (
      task &&
      task.status !== 'COMPLETED' &&
      (task.remainingMs ?? 0) > 0 &&
      task.scheduledDate === todayKey()
    ) {
      await startTask(task)
    }
  }

  const stopTask = async (taskId: string) => {
    await pauseTask(taskId)
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, remainingMs: t.durationMinutes * 60_000 }
            : t
        )
      )
      // Sync to backend
      tasksApi.updateTaskTimer(taskId, {
        remainingMs: task.durationMinutes * 60_000,
      }).catch(console.error)
    }
  }

  /* ================================
     CRUD
  ================================ */
  const addTask = async (
    title: string,
    duration: number,
    category: TaskCategory,
    subtasks: SubTask[] = [],
    scheduledDate?: string
  ) => {
    try {
      const newTask = await tasksApi.createTask({
        title,
        durationMinutes: duration,
        category,
        subtasks: subtasks.map(st => ({ title: st.title, completed: st.completed })),
        scheduledDate: scheduledDate ?? todayKey(),
      })
      setTasks(prev => [normalize([newTask])[0], ...prev])
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  const updateTask = async (
    id: string,
    title: string,
    duration: number,
    category: TaskCategory,
    subtasks?: SubTask[]
  ) => {
    try {
      const task = tasks.find(t => t.id === id)
      if (!task || task.status === 'COMPLETED') return

      const updated = await tasksApi.updateTask(id, {
        title,
        durationMinutes: duration,
        category,
        subtasks: subtasks ?? task.subtasks,
      })
      if (updated) {
        setTasks(prev =>
          prev.map(t => (t.id === id ? normalize([updated])[0] : t))
        )
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const toggleTask = async (id: string) => {
    try {
      const updated = await tasksApi.toggleTask(id)
      if (updated) {
        setTasks(prev =>
          prev.map(t => (t.id === id ? normalize([updated])[0] : t))
        )
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await tasksApi.deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const reorderTasks = async (next: Task[]) => {
    try {
      const taskIds = next.map(t => t.id)
      const updated = await tasksApi.reorderTasks(taskIds)
      setTasks(normalize(updated))
    } catch (error) {
      console.error('Failed to reorder tasks:', error)
    }
  }

  /* ================================
     SUBTASKS
  ================================ */
  const addSubtask = async (taskId: string, title: string) => {
    try {
      const updated = await tasksApi.addSubtask(taskId, title)
      if (updated) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? normalize([updated])[0] : t))
        )
      }
    } catch (error) {
      console.error('Failed to add subtask:', error)
    }
  }

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const updated = await tasksApi.toggleSubtask(taskId, subtaskId)
      if (updated) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? normalize([updated])[0] : t))
        )
      }
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
    }
  }

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const updated = await tasksApi.deleteSubtask(taskId, subtaskId)
      if (updated) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? normalize([updated])[0] : t))
        )
      }
    } catch (error) {
      console.error('Failed to delete subtask:', error)
    }
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
