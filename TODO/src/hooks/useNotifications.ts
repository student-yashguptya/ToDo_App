import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'

export function useNotifications() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })
  }, [])
}
