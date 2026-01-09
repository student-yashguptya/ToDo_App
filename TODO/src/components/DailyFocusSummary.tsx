import { View, Text } from 'react-native'
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { useTasks } from '../context/TaskContext'
import { formatDuration } from '../utils/date'

export function DailyFocusSummary() {
  const { focusedToday } = useTasks()

  const pulse = useSharedValue(1)

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.04, { duration: 1200 }),
      -1,
      true
    )
  }, [])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }))

  return (
    <Animated.View
      entering={FadeInUp.delay(100)}
      style={pulseStyle}
      className="mx-4 mb-3 rounded-2xl overflow-hidden"
    >
      <LinearGradient
        colors={['#fde68a', '#fca5a5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4"
      >
        <Text className="text-sm font-semibold text-amber-900">
          🎯 Focus today
        </Text>

        <Text className="text-2xl font-bold text-amber-950 mt-1">
          {formatDuration(Math.floor(focusedToday / 60))}
        </Text>

        <Text className="text-xs text-amber-800 mt-1">
          Stay consistent, you’re doing great ✨
        </Text>
      </LinearGradient>
    </Animated.View>
  )
}
