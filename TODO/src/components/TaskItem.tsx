import { Text, View, Pressable } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Task, SubTask } from '../types/task'
import { router } from 'expo-router'
import { formatDuration } from '../utils/date'

interface Props {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onLongPress: () => void
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onLongPress,
}: Props) {
  const renderRightActions = () => (
    <Pressable
      onPress={onDelete}
      className="bg-red-600 justify-center items-center w-20"
    >
      <Text className="text-white font-bold">Delete</Text>
    </Pressable>
  )

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={200}
        className={`rounded-xl px-4 py-3 mb-3 ${
          task.completed ? 'bg-gray-100' : 'bg-gray-50'
        }`}
      >
        {/* Task title + navigation */}
        <Pressable onPress={() => router.push(`/edit?id=${task.id}`)}>
          <Text
            className={`text-base font-medium ${
              task.completed
                ? 'line-through text-gray-400'
                : 'text-black'
            }`}
          >
            {task.title}
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            ⏱ {formatDuration(task.durationMinutes)}
          </Text>
        </Pressable>

        {/* Subtasks */}
       {task.subtasks?.length > 0 && (
  <View className="mt-2 ml-2">
    {task.subtasks.map(st => (
      <Text
        key={st.id}
        className={`text-sm ${
          st.completed
            ? 'line-through text-gray-400'
            : 'text-gray-600'
        }`}
      >
        • {st.title}
      </Text>
    ))}
  </View>
)}


        {/* Task actions */}
        <Pressable onPress={onToggle} className="mt-3">
          <Text className="text-blue-600 font-semibold">
            {task.completed ? 'Undo' : 'Done'}
          </Text>
        </Pressable>
      </Pressable>
    </Swipeable>
  )
}
