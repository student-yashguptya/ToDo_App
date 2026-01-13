import { Stack, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import Constants from 'expo-constants'

import { TaskProvider } from '../src/context/TaskContext'
import { getStoredToken } from '../src/services/api'
import {
  registerBackgroundTask,
  requestNotificationPermissions,
} from '../src/services/backgroundTasks'

import '../global.css'

// ✅ Required for Reanimated
import 'react-native-reanimated'

function RootLayoutNav() {
  const router = useRouter()
  const segments = useSegments()

  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const navLock = useRef(false)
  const bgInitRef = useRef(false)

  const isExpoGo = Constants.appOwnership === 'expo'

  // --------------------
  // Restore auth once
  // --------------------
  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const token = await getStoredToken()
        if (mounted) {
          setIsAuthenticated(!!token)
          setAuthChecked(true)
        }
      } catch (e) {
        console.log('Auth restore failed:', e)
        if (mounted) setAuthChecked(true)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  // --------------------
  // Navigation guard
  // --------------------
  useEffect(() => {
    if (!authChecked || !segments.length || navLock.current) return

    const current = segments.join('/')
    const onLogin = current.startsWith('login')

    navLock.current = true

    if (!isAuthenticated && !onLogin) {
      router.replace('/login')
    } else if (isAuthenticated && onLogin) {
      router.replace('/')
    }

    // Unlock after navigation settles
    setTimeout(() => {
      navLock.current = false
    }, 0)
  }, [authChecked, isAuthenticated, segments])

  // --------------------
  // Background tasks (safe)
  // --------------------
  useEffect(() => {
    if (!isAuthenticated) return
    if (isExpoGo) return
    if (bgInitRef.current) return

    bgInitRef.current = true

    ;(async () => {
      try {
        await registerBackgroundTask()
        await requestNotificationPermissions()
      } catch (e) {
        console.log('Background init failed:', e)
      }
    })()
  }, [isAuthenticated])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  )
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TaskProvider>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </TaskProvider>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
