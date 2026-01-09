import { Text, View, Pressable } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Task } from '../types/task'
import { router } from 'expo-router'
import { formatDuration } from '../utils/date'
import { useTasks } from '../context/TaskContext'
import { useEffect } from 'react'

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

  // 🔥 Glow animation for active task
  const glow = useSharedValue(0)

useEffect(() => {
  if (isActive) {
    glow.value = withRepeat(
      withTiming(1, { duration: 900 }),
      -1,
      true
    )
  } else {
    glow.value = withTiming(0)
  }
}, [isActive])

const glowStyle = useAnimatedStyle(() => ({
  shadowOpacity: glow.value * 0.35,
}))


  const renderRightActions = () => (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        onDelete()
      }}
      className="bg-red-500 justify-center items-center w-24 rounded-l-xl"
    >
      <Text className="text-white font-bold">Delete</Text>
    </Pressable>
  )

  return (
    <Swipeable renderRightActions={renderRightActions}>
<Animated.View entering={FadeInUp}>
  <Animated.View
    style={[
      {
        shadowColor: '#facc15',
        shadowRadius: 12,
        elevation: isActive ? 6 : 1,
      },
      glowStyle,
    ]}
    className={`rounded-2xl px-4 py-4 mb-3 ${
      isActive ? 'bg-yellow-100' : 'bg-white'
    }`}
  >
        <Pressable
          onLongPress={onLongPress}
          delayLongPress={200}
          onPress={() => router.push(`/edit?id=${task.id}`)}
        >
          <Text
            className={`text-lg font-semibold ${
              task.completed
                ? 'line-through text-gray-400'
                : 'text-gray-900'
            }`}
          >
            {task.title}
          </Text>

          <Text className="text-sm text-gray-500 mt-1">
            ⏱ {formatDuration(task.durationMinutes)}
          </Text>

          {/* Live countdown */}
          {isActive && (
            <Text className="text-sm text-red-600 mt-1 font-semibold">
              ⏳ {formatDuration(Math.ceil(remainingMs / 60000))}
            </Text>
          )}
        </Pressable>

        {/* Subtasks */}
        {task.subtasks?.length > 0 && (
          <View className="mt-2 ml-1">
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
        <View className="flex-row gap-4 mt-4">
          {!isActive && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync()
                startTask(task)
              }}
            >
              <Text className="text-green-600 font-bold">
                ▶ Start
              </Text>
            </Pressable>
          )}

          {isActive && !paused && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync()
                pauseTask()
              }}
            >
              <Text className="text-yellow-700 font-bold">
                ⏸ Pause
              </Text>
            </Pressable>
          )}

          {isActive && paused && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync()
                resumeTask()
              }}
            >
              <Text className="text-green-700 font-bold">
                ▶ Resume
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              Haptics.impactAsync(
                Haptics.ImpactFeedbackStyle.Light
              )
              onToggle()
            }}
          >
            <Text className="text-blue-600 font-bold">
              {task.completed ? 'Undo' : 'Done'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
      </Animated.View>
    </Swipeable>
  )
}
