import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// --------------------
// API BASE URL (SAFE)
// --------------------
const API_BASE_URL = __DEV__
  ? Platform.select({
      android: 'http://10.0.2.2:3000',
      ios: 'http://localhost:3000',
      default: 'http://172.20.10.3:3000', // ← replace with your LAN IP if needed
    })!
  : 'http://localhost:3000'

// --------------------
const TOKEN_KEY = 'AUTH_TOKEN'
const USER_ID_KEY = 'USER_ID'

// --------------------
// Token management
// --------------------
export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY)
}

export async function storeToken(token: string, userId: string) {
  console.log('STORING TOKEN:', token)
  await AsyncStorage.multiSet([
    ['AUTH_TOKEN', token],
    ['USER_ID', userId],
  ])
}


export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY])
}

export async function getStoredUserId(): Promise<string | null> {
  return AsyncStorage.getItem(USER_ID_KEY)
}

// --------------------
// API helper
// --------------------
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getStoredToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
  if (response.status === 401) {
    await clearStoredToken()
    throw new Error('Unauthorized')
  }

  const error = await response.json().catch(() => ({
    error: 'Request failed',
  }))
  throw new Error(error.error || `HTTP ${response.status}`)
}


  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// --------------------
// Auth API
// --------------------
export const authApi = {
  async register(username: string, password: string) {
    const data = await apiRequest<{ token: string; userId: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    )
    await storeToken(data.token, data.userId)
    return data
  },

  async login(username: string, password: string) {
    const data = await apiRequest<{ token: string; userId: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    )
    await storeToken(data.token, data.userId)
    return data
  },
}

// --------------------
// Tasks API
// --------------------
export const tasksApi = {
  getTasks: (scheduledDate?: string) =>
    apiRequest<any[]>(
      `/api/tasks${scheduledDate ? `?scheduledDate=${scheduledDate}` : ''}`
    ),

  getTask: (taskId: string) =>
    apiRequest<any>(`/api/tasks/${taskId}`),

  createTask: (task: any) =>
    apiRequest<any>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  updateTask: (taskId: string, task: any) =>
    apiRequest<any>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }),

  deleteTask: (taskId: string) =>
    apiRequest<void>(`/api/tasks/${taskId}`, { method: 'DELETE' }),

  toggleTask: (taskId: string) =>
    apiRequest<any>(`/api/tasks/${taskId}/toggle`, { method: 'POST' }),

  startTask: (taskId: string) =>
    apiRequest<any>(`/api/tasks/${taskId}/start`, { method: 'POST' }),

  pauseTask: (taskId: string) =>
    apiRequest<any>(`/api/tasks/${taskId}/pause`, { method: 'POST' }),

  updateTaskTimer: (taskId: string, updates: any) =>
    apiRequest<any>(`/api/tasks/${taskId}/timer`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  addSubtask: (taskId: string, title: string) =>
    apiRequest<any>(`/api/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  toggleSubtask: (taskId: string, subtaskId: string) =>
    apiRequest<any>(
      `/api/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
      { method: 'POST' }
    ),

  deleteSubtask: (taskId: string, subtaskId: string) =>
    apiRequest<any>(
      `/api/tasks/${taskId}/subtasks/${subtaskId}`,
      { method: 'DELETE' }
    ),

  reorderTasks: (taskIds: string[]) =>
    apiRequest<any[]>('/api/tasks/reorder', {
      method: 'PUT',
      body: JSON.stringify({ taskIds }),
    }),
}

// --------------------
// Focus API
// --------------------
export const focusApi = {
  getFocusHistory: (date?: string) =>
    apiRequest<Record<string, number>>(
      `/api/focus${date ? `?date=${date}` : ''}`
    ),

  updateFocus: (date: string, seconds: number) =>
    apiRequest<void>('/api/focus', {
      method: 'PUT',
      body: JSON.stringify({ date, seconds }),
    }),
}
