import { View, Text } from 'react-native'
import { Task } from '../types/task'
import { isToday } from 'date-fns'

export function ProgressIndicator({ tasks }: { tasks: Task[] }) {
  const todayTasks = tasks.filter(t => isToday(new Date(t.createdAt)))
  const completed = todayTasks.filter(t => t.completed).length
  const percent = todayTasks.length === 0 ? 0 : Math.round((completed / todayTasks.length) * 100)

  return (
    <View className="p-4">
      <Text className="text-lg font-semibold">Today’s Progress</Text>
      <View className="h-3 bg-gray-200 rounded-full mt-2">
        <View className="h-3 bg-green-500 rounded-full" style={{ width: `${percent}%` }} />
      </View>
      <Text className="mt-1 text-sm">{percent}% completed</Text>
    </View>
  )
}
