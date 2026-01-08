import { Text, View, Pressable } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Task } from '../types/task'
import { router } from 'expo-router'
import { formatDuration } from '../utils/date'
import { useTasks } from '../context/TaskContext'

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
  const {
    startTask,
    pauseTask,
    resumeTask,
    activeTaskId,
    remainingMs,
    paused,
  } = useTasks()

  const isActive = activeTaskId === task.id

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
          isActive ? 'bg-yellow-200' : 'bg-gray-100'
        }`}
      >
        {/* Task title */}
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

          {/* Live countdown */}
          {isActive && (
            <Text className="text-xs text-red-600 mt-1">
              ⏳ {formatDuration(Math.ceil(remainingMs / 60000))}
            </Text>
          )}
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

        {/* Actions */}
        <View className="flex-row gap-4 mt-3">
          {!isActive && (
            <Pressable onPress={() => startTask(task)}>
              <Text className="text-green-600 font-semibold">
                Start
              </Text>
            </Pressable>
          )}

          {isActive && !paused && (
            <Pressable onPress={pauseTask}>
              <Text className="text-yellow-600 font-semibold">
                Pause
              </Text>
            </Pressable>
          )}

          {isActive && paused && (
            <Pressable onPress={resumeTask}>
              <Text className="text-green-600 font-semibold">
                Resume
              </Text>
            </Pressable>
          )}

          <Pressable onPress={onToggle}>
            <Text className="text-blue-600 font-semibold">
              {task.completed ? 'Undo' : 'Done'}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Swipeable>
  )
}
