import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { TaskProvider } from '../src/context/TaskContext'
import "../global.css"

// ✅ REQUIRED for Reanimated layout animations on Android
import 'react-native-reanimated'

export default function Layout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TaskProvider>
            {/* 🎨 Status bar polish */}
            <StatusBar style="dark" />

            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            />
          </TaskProvider>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
