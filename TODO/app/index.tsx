import { View, Text, Pressable } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
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
    <LinearGradient
      colors={['#f8faff', '#eef2ff']}
      className="flex-1"
    >
      <TaskList
        tasks={tasks}
        refreshing={loading}
        onRefresh={refresh}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onReorder={reorderTasks}
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <Animated.View
              entering={FadeInDown.duration(500)}
              className="px-5 pt-6 pb-4 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-3xl font-extrabold text-gray-900">
                  My Tasks
                </Text>
                <Text className="text-gray-500 mt-1">
                  Stay focused & consistent
                </Text>
              </View>

              <Pressable
                onPress={() => router.push('/add')}
                className="bg-blue-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-semibold">
                  + Add
                </Text>
              </Pressable>
            </Animated.View>

            {/* STATS */}
            <View className="px-4 space-y-3 pb-4">
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <TotalDuration tasks={tasks} />
                <ProgressBar tasks={tasks} />
              </View>

              <View className="bg-blue-50 rounded-2xl p-4">
                <DailyFocusSummary />
              </View>

              <View className="bg-green-50 rounded-2xl p-4">
                <WeeklyFocusReport />
              </View>
            </View>
          </>
        }
      />
    </LinearGradient>
  )
}
