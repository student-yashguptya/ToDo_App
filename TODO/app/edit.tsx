import { View, Text } from 'react-native'
import { useState, useEffect } from 'react'
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated'
import { router, useLocalSearchParams } from 'expo-router'
import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
import { useTasks } from '../src/context/TaskContext'
import { SuccessCheck } from '../src/components/ui/SuccessCheck'
import { BackButton } from '../src/components/ui/BackButton'


export default function EditTask() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { tasks, updateTask } = useTasks()
  const task = tasks.find(t => t.id === id)

  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('0')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setHours(String(Math.floor(task.durationMinutes / 60)))
      setMinutes(String(task.durationMinutes % 60))
    }
  }, [task])

  if (!task) return null

  const handleSave = () => {
    updateTask(
      task.id,
      title.trim(),
      Number(hours) * 60 + Number(minutes)
    )

    setSaved(true)
    setTimeout(() => router.back(), 900)
  }

  return (
    <View className="flex-1 bg-orange-50">
      {saved && <SuccessCheck />}

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-5 pt-10 pb-6"
      >
        <View className="flex-row items-center mb-6">
  <BackButton />
  <Text className="text-xl font-bold ml-3">
    Edit Task
  </Text>
</View>

        <Text className="text-sm text-orange-400 mt-1">
          Refine your focus ✨
        </Text>
      </Animated.View>

      {/* Card */}
      <Animated.View
        entering={FadeInUp.delay(120)}
        className="mx-4 bg-white rounded-3xl px-5 py-6 shadow-xl shadow-orange-200"
      >
        {/* Title */}
        <Input
          placeholder="Task title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Duration */}
        <View className="flex-row justify-between mt-5">
          <Input
            className="w-[48%]"
            placeholder="Hours"
            keyboardType="number-pad"
            value={hours}
            onChangeText={setHours}
          />
          <Input
            className="w-[48%]"
            placeholder="Minutes"
            keyboardType="number-pad"
            value={minutes}
            onChangeText={setMinutes}
          />
        </View>

        {/* CTA */}
        <View className="mt-8">
          <Button
            title="Save Changes"
            onPress={handleSave}
          />
        </View>
      </Animated.View>
    </View>
  )
}
