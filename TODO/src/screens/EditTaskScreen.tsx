import { View } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useTasks } from '../hooks/useTasks'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useState, useEffect } from 'react'
import { Task } from '../types/task'

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { tasks, updateTask } = useTasks()

  const task = tasks.find(t => t.id === id) as Task

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
    }
  }, [task])

  if (!task) return null

  return (
    <View className="flex-1 p-6 bg-white">
      <Input value={title} onChangeText={setTitle} placeholder="Title" />
      <Input
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
      />

      <Button
        title="Update Task"
        onPress={() => {
          updateTask({
            ...task,
            title,
            description,
            updatedAt: new Date().toISOString(),
          })
          router.back()
        }}
      />
    </View>
  )
}
