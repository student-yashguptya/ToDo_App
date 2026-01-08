import { Stack } from 'expo-router'
import { useNotifications } from '../src/hooks/useNotifications'
import { useNotificationPermission } from '../src/hooks/useNotificationPermission'
import "../global.css"
export default function Layout() {
  useNotifications()
  useNotificationPermission()

  return <Stack screenOptions={{ headerShown: true }} />
}
