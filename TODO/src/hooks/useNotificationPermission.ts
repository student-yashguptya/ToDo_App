import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'

export function useNotificationPermission() {
  useEffect(() => {
    Notifications.getPermissionsAsync().then(status => {
      if (status.status !== 'granted') {
        Notifications.requestPermissionsAsync()
      }
    })
  }, [])
}
