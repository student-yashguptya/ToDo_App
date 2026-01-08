import { View, Text } from 'react-native'
import { useTasks } from '../context/TaskContext'
import { formatDuration } from '../utils/date'

export function DailyFocusSummary() {
  const { focusedToday } = useTasks()

  return (
    <View className="mx-4 mb-2 p-3 rounded-xl bg-indigo-50">
      <Text className="text-sm text-indigo-700 font-semibold">
        🎯 Focused today: {formatDuration(Math.floor(focusedToday / 60))}
      </Text>
    </View>
  )
}
