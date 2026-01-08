import { View, Pressable, Text } from 'react-native'
import { router } from 'expo-router'
import { useTasks } from '../hooks/useTasks'
import { TaskList } from '../components/TaskList'
import { ProgressIndicator } from '../components/ProgressIndicator'

export default function HomeScreen() {
  const { tasks, updateTask, deleteTask } = useTasks()

  return (
    <View className="flex-1 bg-white">
      <ProgressIndicator tasks={tasks} />

      <Pressable
        onPress={() => router.push('/add-task')}
        className="mx-4 mb-2 bg-blue-600 rounded-xl p-4"
      >
        <Text className="text-white text-center font-semibold">
          Add Task
        </Text>
      </Pressable>

      <TaskList tasks={tasks} onUpdate={updateTask} onDelete={deleteTask} />
    </View>
  )
}
