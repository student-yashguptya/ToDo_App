import { Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { Task } from '../types/task'

interface Props {
  tasks: Task[]
}

export function ProgressBar({ tasks }: Props) {
  if (tasks.length === 0) return null

  const completed = tasks.filter(t => t.completed).length
  const percent = Math.round((completed / tasks.length) * 100)

  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withTiming(percent, { duration: 600 })
  }, [percent])

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return (
    <View className="px-4 mb-2">
      <Text className="text-sm text-gray-600 mb-1">
        {percent}% completed
      </Text>

      <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          style={barStyle}
          className="h-full bg-blue-600"
        />
      </View>
    </View>
  )
}
