import { View, Text } from 'react-native'
import { useState, useEffect } from 'react'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { router, useLocalSearchParams } from 'expo-router'
import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
import { useTasks } from '../src/context/TaskContext'
import { SuccessCheck } from '../src/components/ui/SuccessCheck'

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
    setTimeout(() => router.back(), 800)
  }

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      {saved && <SuccessCheck />}

      <Animated.Text
        entering={FadeInUp}
        className="text-xl font-bold mb-4"
      >
        Edit Task
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(100)}>
        <Input value={title} onChangeText={setTitle} />

        <View className="flex-row justify-between mt-4">
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

        <View className="mt-6">
          <Button
            title="Save Changes"
            onPress={handleSave}
          />
        </View>
      </Animated.View>
    </View>
  )
}
