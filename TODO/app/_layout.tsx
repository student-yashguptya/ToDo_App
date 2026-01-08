import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { TaskProvider } from '../src/context/TaskContext'
import "../global.css"
export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TaskProvider>
        <Stack screenOptions={{ headerTitleAlign: 'center' }} />
      </TaskProvider>
    </GestureHandlerRootView>
  )
}
