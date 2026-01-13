import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

const isExpoGo = Constants.appOwnership === 'expo'

let permissionGranted: boolean | null = null
let handlerRegistered = false

// --------------------
// Register handler ONCE (SDK 53)
// --------------------
export function initNotifications() {
  if (isExpoGo || handlerRegistered) return

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })

  handlerRegistered = true
}

// --------------------
// Permissions (cached)
// --------------------
export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo) return false
  if (permissionGranted !== null) return permissionGranted

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync()

  if (existingStatus === 'granted') {
    permissionGranted = true
    return true
  }

  const { status } = await Notifications.requestPermissionsAsync()
  permissionGranted = status === 'granted'
  return permissionGranted
}

// --------------------
// Schedule timer completion
// --------------------
export async function scheduleTimerNotification(
  taskTitle: string,
  durationMinutes: number
) {
  if (isExpoGo) return
  if (!(await requestNotificationPermissions())) return

  const trigger: Notifications.NotificationTriggerInput = {
  type: 'date',
  date: new Date(Date.now() + durationMinutes * 60000),
}


  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Timer Complete',
      body: `Timer for "${taskTitle}" has finished!`,
      sound: true,
      data: { type: 'timer_complete' },
    },
    trigger,
  })
}




// --------------------
// Immediate notification
// --------------------
export async function sendNotification(
  title: string,
  body: string
) {
  if (isExpoGo) return
  if (!(await requestNotificationPermissions())) return

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  })
}

// --------------------
// Cancel all notifications
// --------------------
export async function cancelAllNotifications() {
  if (isExpoGo) return
  await Notifications.cancelAllScheduledNotificationsAsync()
}
