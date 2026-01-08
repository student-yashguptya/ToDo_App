import { View, Text } from 'react-native'
import { Task } from '../types/task'

interface Props {
  tasks: Task[]
}

export function TotalDuration({ tasks }: Props) {
  const totalMinutes = tasks.reduce(
    (sum, t) => sum + t.durationMinutes,
    0
  )

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 50

  return (
    <View className="px-4 pb-2">
      <Text className="text-sm text-gray-600">
        Total Today: {hours}h {minutes}m
      </Text>
    </View>
  )
}
