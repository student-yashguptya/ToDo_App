import { View, Text } from 'react-native'
import { useState } from 'react'
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
import { useTasks } from '../src/context/TaskContext'
import { SubTaskEditor } from '../src/components/SubTaskEditor'
import { SubTask } from '../src/types/task'
import { SuccessCheck } from '../src/components/ui/SuccessCheck'

export default function AddTask() {
  const { addTask } = useTasks()

  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('30')
  const [category, setCategory] = useState('default')
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const total =
      Number(hours || 0) * 60 + Number(minutes || 0)

    if (!title.trim() || total <= 0) return

    addTask(title.trim(), total, category, subtasks)
    setSaved(true)

    setTimeout(() => router.back(), 800)
  }

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      {saved && <SuccessCheck />}

      <Animated.Text
        entering={FadeInDown}
        className="text-xl font-bold mb-4"
      >
        Add Task
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(100)}>
        <Input
          placeholder="Task title"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          className="mt-3"
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />

        <View className="flex-row mt-4 justify-between">
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

        <SubTaskEditor
          subtasks={subtasks}
          onChange={setSubtasks}
        />

        <View className="mt-6">
          <Button title="Save Task" onPress={handleSave} />
        </View>
      </Animated.View>
    </View>
  )
}
