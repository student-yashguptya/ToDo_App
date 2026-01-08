import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useTasks } from '../src/context/TaskContext'
import { TaskList } from '../src/components/TaskList'
import { ProgressBar } from '../src/components/ProgressBar'
import { Loader } from '../src/components/ui/Loader'
import { TotalDuration } from '../src/components/TotalDuration'

export default function Home() {
  const {
    tasks,
    loading,
    toggleTask,
    deleteTask,
    refresh,
    reorderTasks,
  } = useTasks()

  if (loading) {
    return <Loader />
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 py-4 flex-row justify-between items-center">
        <Text className="text-2xl font-bold">My Tasks</Text>

        <Pressable onPress={() => router.push('/add')}>
          <Text className="text-blue-600 font-semibold">Add</Text>
        </Pressable>
      </View>

      <TotalDuration tasks={tasks} />
      <ProgressBar tasks={tasks} />

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
