import { View, TextInput, Pressable, Text } from 'react-native'
import { SubTask } from '../types/task'
import { useState } from 'react'

interface Props {
  subtasks: SubTask[]
  onChange: (next: SubTask[]) => void
}

export function SubTaskEditor({ subtasks, onChange }: Props) {
  const [text, setText] = useState('')

  const addSubtask = () => {
    if (!text.trim()) return
    onChange([
      ...subtasks,
      {
        id: Date.now().toString(),
        title: text.trim(),
        completed: false,
      },
    ])
    setText('')
  }

  return (
    <View className="mt-4">
      <Text className="font-semibold mb-2">Subtasks</Text>

      {subtasks.map(st => (
        <Text key={st.id} className="text-sm text-gray-600 ml-2">
          • {st.title}
        </Text>
      ))}

      <View className="flex-row mt-2">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add subtask"
          className="flex-1 border rounded-lg px-3 py-2 mr-2"
        />
        <Pressable onPress={addSubtask}>
          <Text className="text-blue-600 font-semibold">Add</Text>
        </Pressable>
      </View>
    </View>
  )
}
