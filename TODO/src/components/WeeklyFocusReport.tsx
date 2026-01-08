import { View, Text } from 'react-native'
import { useTasks } from '../context/TaskContext'

function format(sec: number) {
  const m = Math.floor(sec / 60)
  const h = Math.floor(m / 60)
  const r = m % 60
  return h > 0 ? `${h}h ${r}m` : `${r}m`
}

export function WeeklyFocusReport() {
  const { weeklyFocus } = useTasks()

  const total = weeklyFocus.reduce(
    (sum, d) => sum + d.seconds,
    0
  )

  return (
    <View className="mx-4 my-4 p-4 rounded-xl bg-emerald-50">
      <Text className="text-lg font-bold text-emerald-800 mb-2">
        📊 Weekly Focus
      </Text>

      {weeklyFocus.map(day => (
        <View
          key={day.date}
          className="flex-row justify-between py-1"
        >
          <Text className="text-sm text-gray-700">
            {day.date}
          </Text>
          <Text className="text-sm font-semibold">
            {format(day.seconds)}
          </Text>
        </View>
      ))}

      <View className="border-t border-emerald-200 mt-2 pt-2">
        <Text className="font-semibold text-emerald-900">
          Total: {format(total)}
        </Text>
      </View>
    </View>
  )
}
