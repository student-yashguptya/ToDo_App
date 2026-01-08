import { useEffect, useState } from 'react'
import { Task } from '../types/task'
import { loadTasks, saveTasks } from '../storage/taskStorage'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks().then(stored => {
      setTasks(stored)
      setLoading(false)
    })
  }, [])

  const persist = (next: Task[]) => {
    setTasks(next)
    saveTasks(next)
  }

  const updateTask = (id: string, title: string, durationMinutes: number) => {
  persist(
    tasks.map(task =>
      task.id === id
        ? { ...task, title, durationMinutes }
        : task
    )
  )
}


  const addTask = (title: string, durationMinutes: number) => {
  const newTask: Task = {
    id: Date.now().toString(),
    title,
    completed: false,
    createdAt: Date.now(),
    durationMinutes,
  }

  persist([newTask, ...tasks])
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
  toggleTask,
  deleteTask,
  updateTask,
}


}
