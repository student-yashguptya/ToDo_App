import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TaskProvider } from '../src/context/TaskContext'
import "../global.css"

export default function Layout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TaskProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </TaskProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
