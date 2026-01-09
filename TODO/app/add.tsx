import { View, Text } from 'react-native'
import { useState } from 'react'
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated'
import { router } from 'expo-router'

import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
import { BackButton } from '../src/components/ui/BackButton'
import { SuccessCheck } from '../src/components/ui/SuccessCheck'

import { useTasks } from '../src/context/TaskContext'
import { SubTaskEditor } from '../src/components/SubTaskEditor'
import { SubTask } from '../src/types/task'

export default function AddTask() {
  const { addTask } = useTasks()

  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('30')
  const [category, setCategory] = useState('default')
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const totalMinutes =
      Number(hours || 0) * 60 + Number(minutes || 0)

    if (!title.trim() || totalMinutes <= 0) return

    addTask(title.trim(), totalMinutes, category, subtasks)
    setSaved(true)

    // Smooth exit after success animation
    setTimeout(() => router.back(), 900)
  }

  return (
    <View className="flex-1 bg-orange-50">
      {saved && <SuccessCheck />}

      {/* HEADER */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-5 pt-10 pb-6"
      >
        <View className="flex-row items-center gap-3 mb-4">
    <BackButton />

    <View>
      <Text className="text-2xl font-extrabold text-orange-600">
        Add Task
      </Text>
      <Text className="text-sm text-orange-400">
        Plan your focus intentionally
      </Text>
    </View>
  </View>
      </Animated.View>

      {/* MAIN CARD */}
      <Animated.View
        entering={FadeInUp.delay(120)}
        className="mx-4 bg-white rounded-3xl px-5 py-6 shadow-xl shadow-orange-200"
      >
        {/* Title */}
        <Input
          placeholder="What do you want to work on?"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Input
          className="mt-4"
          placeholder="Category (Work, Study, Personal)"
          value={category}
          onChangeText={setCategory}
        />

        {/* Duration */}
        <View className="flex-row mt-5 justify-between">
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

        {/* Subtasks */}
        <View className="mt-4">
          <SubTaskEditor
            subtasks={subtasks}
            onChange={setSubtasks}
          />
        </View>

        {/* CTA */}
        <View className="mt-8">
          <Button title="Save Task" onPress={handleSave} />
        </View>
      </Animated.View>
    </View>
  )
}
