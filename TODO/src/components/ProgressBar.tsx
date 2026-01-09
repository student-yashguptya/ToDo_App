import { Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
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

  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withSpring(percent, {
      damping: 15,
      stiffness: 120,
    })
  }, [percent])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }))

  const getMessage = () => {
    if (percent === 100) return '🔥 All done! Amazing focus'
    if (percent >= 60) return '💪 Almost there'
    if (percent >= 30) return '🚀 Good progress'
    return '✨ Let’s get started'
  }

  return (
    <View className="px-4 mb-4">
      {/* Label */}
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm font-medium text-gray-700">
          {getMessage()}
        </Text>
        <Text className="text-sm font-semibold text-gray-700">
          {percent}%
        </Text>
      </View>

      {/* Track */}
      <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View style={[animatedStyle]} className="h-full">
          <LinearGradient
            colors={['#f97316', '#facc15', '#22c55e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
    </View>
  )
}
