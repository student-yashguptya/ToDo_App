import { Text, View, Pressable, Animated as RNAnimated } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import Animated, { FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Task } from '../types/task'
import { formatDuration } from '../utils/date'
import { formatMilliseconds } from '../utils/duration'
import { useTasks } from '../context/TaskContext'
import { memo, useEffect, useMemo, useRef } from 'react'

interface Props {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onLongPress: () => void
  onEdit: () => void
}

export const TaskItem = memo(function TaskItem({
  task,
  onToggle,
  onDelete,
  onLongPress,
  onEdit,
}: Props) {
  const {
    startTask,
    pauseTask,
    resumeTask,
    activeTaskId,
    paused,
  } = useTasks()

  const isActive = useMemo(
    () => activeTaskId === task.id,
    [activeTaskId, task.id]
  )

  const isRunning = !!task.running

  /* ================================
     SAFE GLOW (RN Animated)
  ================================ */
  const glow = useRef(new RNAnimated.Value(0)).current

  useEffect(() => {
    if (isRunning) {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(glow, {
            toValue: 1,
            duration: 900,
            useNativeDriver: false,
          }),
          RNAnimated.timing(glow, {
            toValue: 0,
            duration: 900,
            useNativeDriver: false,
          }),
        ])
      ).start()
    } else {
      glow.stopAnimation()
      glow.setValue(0)
    }
  }, [isRunning])

  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.35],
  })

  /* ================================
     Swipe Delete (NO HOOKS)
  ================================ */
  const renderRightActions = (_: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-120, 0],
      outputRange: [1, 0.85],
      extrapolate: 'clamp',
    })

    return (
      <RNAnimated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(
              Haptics.ImpactFeedbackStyle.Heavy
            )
            onDelete()
          }}
          style={{
            backgroundColor: '#ef4444',
            justifyContent: 'center',
            alignItems: 'center',
            width: 96,
            height: '100%',
            borderRadius: 16,
          }}
        >
          <Text className="text-white font-bold">
            Delete
          </Text>
        </Pressable>
      </RNAnimated.View>
    )
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={64}
      overshootRight={false}
      friction={2}
    >
      <Animated.View entering={FadeInUp}>
        <Pressable
          onPress={onEdit}
          onLongPress={onLongPress}
          delayLongPress={200}
        >
          <RNAnimated.View
            style={{
              shadowColor: '#facc15',
              shadowRadius: 12,
              shadowOpacity,
              elevation: isRunning ? 6 : 1,
            }}
            className={`rounded-2xl px-4 py-4 mb-3 ${
              isRunning ? 'bg-yellow-100' : 'bg-white'
            }`}
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

            {isActive && task.remainingMs !== undefined && (
              <Text className="text-sm text-red-600 mt-1 font-semibold">
                ⏳ {formatMilliseconds(task.remainingMs)}
              </Text>
            )}

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

            <View className="flex-row gap-4 mt-4">
              {!isRunning && (
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

              {isRunning && !paused && (
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync()
                    pauseTask(task.id)
                  }}
                >
                  <Text className="text-yellow-700 font-bold">
                    ⏸ Pause
                  </Text>
                </Pressable>
              )}

              {isRunning && paused && (
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync()
                    resumeTask(task.id)
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
          </RNAnimated.View>
        </Pressable>
      </Animated.View>
    </Swipeable>
  )
})
