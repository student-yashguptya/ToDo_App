import { View } from 'react-native'
import { useState } from 'react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useTasks } from '../hooks/useTasks'
import { router } from 'expo-router'

export default function AddTaskScreen() {
  const { addTask } = useTasks()
  const [title, setTitle] = useState('')

  return (
    <View className="flex-1 p-6 bg-white">
      <Input placeholder="Task title" value={title} onChangeText={setTitle} />

      <Button
        title="Save Task"
        onPress={() => {
          addTask({
            title,
            description: '',
            categoryId: '',
            deadline: new Date().toISOString(),
            completed: false,
          })
          router.back()
        }}
      />
    </View>
  )
}
