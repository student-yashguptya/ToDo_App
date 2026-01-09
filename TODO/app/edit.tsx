import { View, Text, Alert } from 'react-native'
import { useState, useEffect } from 'react'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'

import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
import { SuccessCheck } from '../src/components/ui/SuccessCheck'
import { BackButton } from '../src/components/ui/BackButton'

import { SubTaskEditor } from '../src/components/SubTaskEditor'

import { useTasks } from '../src/context/TaskContext'
import { Task, SubTask } from '../src/types/task'

export default function EditTask({
  task,
  onClose,
}: {
  task: Task
  onClose: () => void
}) {
  const { updateTask, pauseTask } = useTasks()

  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('0')
  const [saved, setSaved] = useState(false)
  const [subtasks, setSubtasks] = useState<SubTask[]>([])

  /* ================================
     HARD BLOCK: COMPLETED TASK
  ================================ */
  useEffect(() => {
    if (task.status === 'COMPLETED') {
      Alert.alert(
        'Task Completed',
        'Completed tasks cannot be edited.',
        [{ text: 'OK', onPress: onClose }]
      )
      return
    }

    setTitle(task.title)
    setHours(String(Math.floor(task.durationMinutes / 60)))
    setMinutes(String(task.durationMinutes % 60))
    setSubtasks(task.subtasks ?? [])
  }, [task])

  /* ================================
     SAVE HANDLER
  ================================ */
const handleSave = () => {
  if (task.status === 'COMPLETED') return

  const newDuration =
    Number(hours || 0) * 60 + Number(minutes || 0)

  if (!title.trim() || newDuration <= 0) return

  if (task.status === 'RUNNING') {
    pauseTask(task.id)
  }

  // ✅ SAVE SUBTASKS TOO
  updateTask(
    task.id,
    title.trim(),
    newDuration,
    task.category,
    subtasks
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
          Update task details ✨
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

        {/* Subtasks (ADD ONLY) */}
        <View className="mt-4">
          <SubTaskEditor
            subtasks={subtasks}
            onChange={setSubtasks}
          />
        </View>

        {/* Save */}
        <View className="mt-8">
          <Button title="Save Changes" onPress={handleSave} />
        </View>
      </Animated.View>
    </View>
  )
}
