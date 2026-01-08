import { View, Text, Pressable } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { router } from 'expo-router'
import { useTasks } from '../src/context/TaskContext'
import { TaskList } from '../src/components/TaskList'
import { ProgressBar } from '../src/components/ProgressBar'
import { Loader } from '../src/components/ui/Loader'
import { TotalDuration } from '../src/components/TotalDuration'
import { DailyFocusSummary } from '../src/components/DailyFocusSummary'
import { WeeklyFocusReport } from '@/src/components/WeeklyFocusReport'

export default function Home() {
  const {
    tasks,
    loading,
    toggleTask,
    deleteTask,
    refresh,
    reorderTasks,
  } = useTasks()

  if (loading) return <Loader />

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-4 py-4 flex-row justify-between items-center"
      >
        <Text className="text-2xl font-bold">My Tasks</Text>

        <Pressable onPress={() => router.push('/add')}>
          <Text className="text-blue-600 font-semibold">
            Add
          </Text>
        </Pressable>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(100)}>
        <TotalDuration tasks={tasks} />
        <ProgressBar tasks={tasks} />
        <DailyFocusSummary />
        <WeeklyFocusReport />
      </Animated.View>

      {/* Task list */}
      <TaskList
        tasks={tasks}
        refreshing={loading}
        onRefresh={refresh}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onReorder={reorderTasks}
      />
    </View>
  )
}
