import { View, Text } from 'react-native'
import { useState, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
import { useTasks } from '../src/hooks/useTasks'

export default function EditTask() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { tasks, updateTask } = useTasks()
  const task = tasks.find(t => t.id === id)

  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('0')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setHours(String(Math.floor(task.durationMinutes / 60)))
      setMinutes(String(task.durationMinutes % 60))
    }
  }, [task])

  if (!task) return null

  const handleSave = () => {
    const durationMinutes =
      Number(hours) * 60 + Number(minutes)

    updateTask(task.id, title.trim(), durationMinutes)
    router.back()
  }

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      <Text className="text-xl font-bold mb-4">
        Edit Task
      </Text>

      <Input value={title} onChangeText={setTitle} />

      <View className="flex-row justify-between mt-4">
        <View className="w-[48%]">
          <Input
            placeholder="Hours"
            keyboardType="number-pad"
            value={hours}
            onChangeText={setHours}
          />
        </View>

        <View className="w-[48%]">
          <Input
            placeholder="Minutes"
            keyboardType="number-pad"
            value={minutes}
            onChangeText={setMinutes}
          />
        </View>
      </View>

      <View className="mt-4">
        <Button title="Save Changes" onPress={handleSave} />
      </View>
    </View>
  )
}
