import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

import { tasksApi, getStoredToken } from './api'

const BACKGROUND_TASK_NAME = 'task-timer-sync'
const isExpoGo = Constants.appOwnership === 'expo'

// --------------------
// Notification handler (SDK 53)
// --------------------
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })
}

// --------------------
// Define task ONCE
// --------------------
if (!TaskManager.isTaskDefined(BACKGROUND_TASK_NAME)) {
  TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
    try {
      const token = await getStoredToken()
      if (!token) {
        return BackgroundFetch.BackgroundFetchResult.NoData
      }

      const today = new Date().toISOString().slice(0, 10)

      let tasks
      try {
        tasks = await tasksApi.getTasks(today)
      } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed
      }

      const now = Date.now()

      for (const task of tasks) {
        if (task.status !== 'RUNNING' || !task.lastResumedAt) continue

        const elapsed = now - task.lastResumedAt
        const totalMs = task.durationMinutes * 60000
        const prevRemaining = task.remainingMs ?? totalMs
        const nextRemaining = Math.max(prevRemaining - elapsed, 0)

        if (nextRemaining === 0) {
          await tasksApi.updateTaskTimer(task.id, {
            remainingMs: 0,
            status: 'PAUSED',
            exhaustedOn: today,
            lastResumedAt: undefined,
          })

          if (!isExpoGo) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Timer Complete',
                body: `Timer for "${task.title}" has finished!`,
                sound: true,
              },
              trigger: null,
            })
          }
        } else {
          await tasksApi.updateTaskTimer(task.id, {
            remainingMs: nextRemaining,
            lastResumedAt: now,
          })
        }
      }

      return BackgroundFetch.BackgroundFetchResult.NewData
    } catch (error) {
      console.log('Background task error:', error)
      return BackgroundFetch.BackgroundFetchResult.Failed
    }
  })
}

// --------------------
// Register task
// --------------------
export async function registerBackgroundTask() {
  if (isExpoGo) return

  const status = await BackgroundFetch.getStatusAsync()
  if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
    console.log('Background fetch unavailable')
    return
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_TASK_NAME
  )
  if (isRegistered) return

  await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 15, // best effort
    stopOnTerminate: false,
    startOnBoot: true,
  })

  console.log('Background task registered')
}

// --------------------
// Unregister task
// --------------------
export async function unregisterBackgroundTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_TASK_NAME
  )

  if (!isRegistered) return

  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME)
  console.log('Background task unregistered')
}

// --------------------
// Notification permission
// --------------------
export async function requestNotificationPermissions() {
  if (isExpoGo) return false

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync()

  if (existingStatus === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}
