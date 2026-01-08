import { View, Text } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
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

  const handleSave = () => {
    if (!title.trim()) return

    const totalMinutes =
      Number(hours || 0) * 60 + Number(minutes || 0)

    if (totalMinutes <= 0) return

    addTask(
      title.trim(),
      totalMinutes,
      category,
      subtasks
    )

    router.back()
  }

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      <Text className="text-xl font-bold mb-4">Add Task</Text>

      {/* Task title */}
      <Input
        placeholder="Task title"
        value={title}
        onChangeText={setTitle}
      />

      {/* Category (simple for now) */}
      <Input
        className="mt-3"
        placeholder="Category (e.g. Work, Personal)"
        value={category}
        onChangeText={setCategory}
      />

      {/* Duration */}
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

      {/* Subtasks */}
      <SubTaskEditor
        subtasks={subtasks}
        onChange={setSubtasks}
      />

      <View className="mt-6">
        <Button title="Save Task" onPress={handleSave} />
      </View>
    </View>
  )
}
