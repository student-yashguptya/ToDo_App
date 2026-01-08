import { View, Text, Pressable } from 'react-native'
import { Task } from '../types/task'
import { formatDateTime } from '../utils/date'

interface Props {
  task: Task
  onToggle: () => void
  onDelete: () => void
}

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <View className="p-4 bg-gray-100 rounded-xl mb-3">
      <Pressable onPress={onToggle}>
        <Text className={`text-lg font-semibold ${task.completed && 'line-through'}`}>
          {task.title}
        </Text>
      </Pressable>

      {task.description && (
        <Text className="text-gray-600 mt-1">{task.description}</Text>
      )}

      <Text className="text-xs text-gray-500 mt-2">
        Due: {formatDateTime(task.deadline)}
      </Text>

      <Pressable onPress={onDelete} className="mt-2">
        <Text className="text-red-500">Delete</Text>
      </Pressable>
    </View>
  )
}
