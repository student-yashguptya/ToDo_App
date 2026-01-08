import { useEffect, useState } from 'react'
import { Task } from '../types/task'
import { storageService } from '../services/storageService'
import { STORAGE_KEYS } from '../constants/storageKeys'
import * as Crypto from 'expo-crypto'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    storageService.get<Task[]>(STORAGE_KEYS.TASKS).then(stored => {
      if (stored) setTasks(stored)
    })
  }, [])

  const persist = (data: Task[]) => {
    setTasks(data)
    storageService.set(STORAGE_KEYS.TASKS, data)
  }

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()

    persist([
      ...tasks,
      {
        ...task,
        id: Crypto.randomUUID(), // ✅ SAFE
        createdAt: now,
        updatedAt: now,
      },
    ])
  }

  const updateTask = (task: Task) => {
    persist(tasks.map(t => (t.id === task.id ? task : t)))
  }

  const deleteTask = (id: string) => {
    persist(tasks.filter(t => t.id !== id))
  }

  return { tasks, addTask, updateTask, deleteTask }
}
