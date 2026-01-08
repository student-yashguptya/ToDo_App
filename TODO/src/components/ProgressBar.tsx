import { View, Text } from 'react-native'
import { Task } from '../types/task'

interface Props {
  tasks: Task[]
}

export function ProgressBar({ tasks }: Props) {
  if (tasks.length === 0) return null

  const completed = tasks.filter(t => t.completed).length
  const percent = Math.round((completed / tasks.length) * 100)

  return (
    <View className="px-4 mb-2">
      <Text className="text-sm text-gray-600 mb-1">
        {percent}% completed
      </Text>

      <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-blue-600"
          style={{ width: `${percent}%` }}
        />
      </View>
    </View>
  )
}
