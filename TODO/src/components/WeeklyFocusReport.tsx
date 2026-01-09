import { View, Text } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useTasks } from '../context/TaskContext'

function format(sec: number) {
  const m = Math.floor(sec / 60)
  const h = Math.floor(m / 60)
  const r = m % 60
  return h > 0 ? `${h}h ${r}m` : `${r}m`
}

export function WeeklyFocusReport() {
  const { weeklyFocus } = useTasks()

  const max = Math.max(...weeklyFocus.map(d => d.seconds), 1)

  return (
    <Animated.View
      entering={FadeInUp.delay(200)}
      className="mx-4 my-4 p-4 rounded-2xl bg-white shadow-sm"
    >
      <Text className="text-lg font-bold text-gray-900 mb-3">
        📊 Weekly Focus
      </Text>

      {weeklyFocus.map((day, index) => {
        const percent = Math.round(
          (day.seconds / max) * 100
        )

        return (
          <Animated.View
            key={day.date}
            entering={FadeInUp.delay(80 * index)}
            className="mb-3"
          >
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-700">
                {day.date}
              </Text>
              <Text className="text-sm font-semibold">
                {format(day.seconds)}
              </Text>
            </View>

            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <LinearGradient
                colors={['#60a5fa', '#34d399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${percent}%`, height: '100%' }}
              />
            </View>
          </Animated.View>
        )
      })}
    </Animated.View>
  )
}
