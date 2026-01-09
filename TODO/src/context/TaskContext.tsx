import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Task, SubTask } from '../types/task';
import { loadTasks, saveTasks } from '../storage/taskStorage';
import {
  startTimer, pauseTimer, resumeTimer, stopTimer
} from '../services/taskTimer';
import { playAlarm } from '../services/alarmSound';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ================================
   Focus history
================================ */
const FOCUS_KEY = 'FOCUS_HISTORY'
type FocusHistory = Record<string, number>

const todayKey = () =>
  new Date().toISOString().slice(0, 10)

/* ================================
   Context types
================================ */
interface TaskContextValue {
  tasks: Task[]
  loading: boolean
  refreshing: boolean

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

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [remainingMs, setRemainingMs] = useState(0)
  const [paused, setPaused] = useState(false)

  const [focusHistory, setFocusHistory] = useState<FocusHistory>({})
  const focusRef = useRef<FocusHistory>({})
  const saveCounter = useRef(0)

  /* ---------- helpers ---------- */

  const normalize = (raw: Task[]): Task[] =>
    raw.map(t => ({
      ...t,
      subtasks: t.subtasks ?? [],
      category: t.category ?? 'default',
    }))

   const persist = async (updater: (prev: Task[]) => Task[]) => {
    setTasks(prev => {
      const next = updater(prev);
      saveTasks(next).catch(error => {
        console.error("Failed to save tasks:", error);
      });
      return next;
    });
  };

  const completeTaskById = (taskId: string) => {
    persist(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      )
    )
  }
   useEffect(() => {
    refresh().catch(console.error);
    loadFocusHistory().catch(console.error);

    return () => {
      stopTimer();
    };
  }, []);

  /* ---------- lifecycle ---------- */

  useEffect(() => {
  const init = async () => {
    setLoading(true)
    const raw = await loadTasks()
    setTasks(normalize(raw))
    setLoading(false)
  }

  init()
  loadFocusHistory()

  return () => stopTimer()
}, [])

  const refresh = async () => {
  try {
    setRefreshing(true)
    const raw = await loadTasks()
    setTasks(normalize(raw))
  } catch (e) {
    console.error('Refresh failed', e)
  } finally {
    setRefreshing(false)
  }
}


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

  /* ---------- TIMER ---------- */

  const startTask = (task: Task) => {
    setActiveTaskId(task.id)
    setPaused(false)

    startTimer(
      task.durationMinutes,

      // tick
      ms => {
        setRemainingMs(ms)

        const key = todayKey()
        focusRef.current[key] =
          (focusRef.current[key] ?? 0) + 1

        saveCounter.current++

        if (saveCounter.current >= 10) {
          saveCounter.current = 0
          persistFocusHistory()
          setFocusHistory({ ...focusRef.current })
        }
      },

      // half
      async () => {
        await playAlarm()
      },

      // complete
      async () => {
        await playAlarm()
        completeTaskById(task.id)
        setActiveTaskId(null)
        setRemainingMs(0)
        persistFocusHistory()
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
  if (id === activeTaskId) {
    stopTask()
  }

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
                { id: Date.now().toString(), title, completed: false },
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
              subtasks: task.subtasks.filter(st => st.id !== subtaskId),
            }
          : task
      )
    )
  }

  /* ---------- WEEKLY ---------- */

  const weeklyFocus = useMemo(() => {
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
  }, [focusHistory])

  const focusedToday = focusHistory[todayKey()] ?? 0

  return (
    <TaskContext.Provider
      value={{
        refreshing,
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
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks must be used inside TaskProvider');
  }
  return ctx;
}
