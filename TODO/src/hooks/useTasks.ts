import { useEffect, useState } from 'react'
import { Task } from '../types/task'
import { loadTasks, saveTasks } from '../storage/taskStorage'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const stored = await loadTasks()
        setTasks(stored)
      } catch (e) {
        console.error('Failed to load tasks', e)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const persist = (next: Task[]) => {
    setTasks(next)
    try {
      saveTasks(next)
    } catch (e) {
      console.error('Failed to save tasks', e)
    }
  }

  const addTask = (
    title: string,
    durationMinutes: number,
    category: Task['category']
  ) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now(),
      durationMinutes,
      category,
      subtasks: [],
    }

    persist([newTask, ...tasks])
  }

  const updateTask = (
    id: string,
    title: string,
    durationMinutes: number,
    category: Task['category']
  ) => {
    persist(
      tasks.map(task =>
        task.id === id
          ? { ...task, title, durationMinutes, category }
          : task
      )
    )
  }

  const toggleTask = (id: string) => {
    persist(
      tasks.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    )
  }

  const deleteTask = (id: string) => {
    persist(tasks.filter(task => task.id !== id))
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  }
}
