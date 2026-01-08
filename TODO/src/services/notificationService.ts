import * as Notifications from 'expo-notifications'
import { calculateHalfwayTime } from '../utils/notificationTiming'

function toCalendarTrigger(date: Date): Notifications.CalendarTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  }
}
// ...existing code...

export async function scheduleTaskNotifications(
  taskId: string,
  title: string,
  createdAt: Date,
  deadline: Date
) {
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync()
  }

  const halfway = calculateHalfwayTime(createdAt, deadline)

  // Halfway reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: `Halfway reminder: ${title}`,
      data: { taskId, type: 'HALF' },
    },
    trigger: toCalendarTrigger(halfway),
  })

  // Deadline reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Due',
      body: title,
      data: { taskId, type: 'DEADLINE' },
    },
    trigger: toCalendarTrigger(deadline),
  })
}
