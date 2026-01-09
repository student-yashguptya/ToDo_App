import { View, Text } from 'react-native'
import { useState, useEffect } from 'react'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
import { useTasks } from '../src/context/TaskContext'
import { SuccessCheck } from '../src/components/ui/SuccessCheck'
import { BackButton } from '../src/components/ui/BackButton'
import { Task } from '../src/types/task'

export default function EditTask({
  task,
  onClose,
}: {
  task: Task
  onClose: () => void
}) {
  const { updateTask } = useTasks()

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

  const handleSave = () => {
    updateTask(
      task.id,
      title.trim(),
      Number(hours) * 60 + Number(minutes)
    )

    setSaved(true)
    setTimeout(onClose, 900)
  }

  return (
    <View className="bg-orange-50 flex-1">
      {saved && <SuccessCheck />}

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-5 pt-2 pb-6"
      >
        <View className="flex-row items-center mb-2">
          <BackButton onPress={onClose} />
          <Text className="text-xl font-bold ml-3">
            Edit Task
          </Text>
        </View>

        <Text className="text-sm text-orange-400">
          Refine your focus ✨
        </Text>
      </Animated.View>

      {/* Card */}
      <Animated.View
        entering={FadeInUp.delay(120)}
        className="mx-4 bg-white rounded-3xl px-5 py-6 shadow-xl shadow-orange-200"
      >
        <Input
          placeholder="Task title"
          value={title}
          onChangeText={setTitle}
        />

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

        <View className="mt-8">
          <Button title="Save Changes" onPress={handleSave} />
        </View>
      </Animated.View>
    </View>
  )
}
