import AsyncStorage from '@react-native-async-storage/async-storage'
import { Task } from '../types/task'

const STORAGE_KEY = 'TASKS_V1'
export async function clearTasks() {
  await AsyncStorage.removeItem('TASKS_V1')
}
export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}
