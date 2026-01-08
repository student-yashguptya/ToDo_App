import { View, Text, Pressable } from 'react-native'
import { SubTask } from '../types/task'

interface Props {
  subtasks: SubTask[]
  onToggle: (id: string) => void
}

export function SubTaskList({ subtasks, onToggle }: Props) {
  if (subtasks.length === 0) return null

  return (
    <View className="mt-2 ml-3">
      {subtasks.map(st => (
        <Pressable key={st.id} onPress={() => onToggle(st.id)}>
          <Text
            className={`text-sm ${
              st.completed ? 'line-through text-gray-400' : 'text-gray-700'
            }`}
          >
            • {st.title}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
