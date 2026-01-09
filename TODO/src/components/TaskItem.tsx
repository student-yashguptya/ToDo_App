import {
  Text,
  View,
  Pressable,
  Animated as RNAnimated,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import Animated, { FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Task } from '../types/task'
import { formatDuration } from '../utils/date'
import { formatMilliseconds } from '../utils/duration'
import { useTasks } from '../context/TaskContext'
import { memo, useEffect, useRef } from 'react'

interface Props {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onLongPress?: () => void
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
    toggleSubtask, // ✅ from context
  } = useTasks()

  const isRunning = task.status === 'RUNNING'
  const isCompleted = task.status === 'COMPLETED'

  /* ================================
     Subtask progress
  ================================ */
  const totalSubtasks = task.subtasks.length
  const completedSubtasks = task.subtasks.filter(
    st => st.completed
  ).length

  const progressPercent =
    totalSubtasks === 0
      ? 0
      : Math.round(
          (completedSubtasks / totalSubtasks) * 100
        )

  /* ================================
     Glow animation
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

  const backgroundColor = isCompleted
    ? '#fee2e2'
    : isRunning
    ? '#fef9c3'
    : '#ffffff'

  const shadowColor = isCompleted
    ? '#ef4444'
    : isRunning
    ? '#facc15'
    : '#000000'

  /* ================================
     Swipe delete
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
              backgroundColor,
              shadowColor,
              shadowRadius: 12,
              shadowOpacity,
              elevation: isRunning ? 6 : 1,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
            }}
          >
            {/* Title */}
            <Text className="text-lg font-semibold">
              {task.title}
            </Text>

            {/* Duration */}
            <Text className="text-sm text-gray-500 mt-1">
              ⏱ {formatDuration(task.durationMinutes)}
            </Text>

            {/* Remaining */}
            {!isCompleted && (
              <Text className="text-sm text-red-600 mt-1 font-semibold">
                ⏳ {formatMilliseconds(task.remainingMs ?? 0)}
              </Text>
            )}

            {/* Completed */}
            {isCompleted && (
              <Text className="text-sm font-bold text-red-600 mt-2">
                ✅ Completed
              </Text>
            )}

            {/* ================================
                SUBTASK PROGRESS + LIST
            ================================ */}
            {totalSubtasks > 0 && (
              <View className="mt-3">
                {/* Progress label */}
                <Text className="text-xs text-gray-500 mb-1">
                  Subtasks {completedSubtasks}/{totalSubtasks}
                </Text>

                {/* Progress bar */}
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full bg-emerald-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </View>

                {/* Subtask list */}
                <View className="space-y-1">
                  {task.subtasks.map(st => (
                    <Pressable
                      key={st.id}
                      onPress={() => {
                        Haptics.selectionAsync()
                        toggleSubtask(task.id, st.id)
                      }}
                      className="flex-row items-center"
                    >
                      <Text className="mr-2">
                        {st.completed ? '✅' : '⬜'}
                      </Text>
                      <Text
                        className={`text-sm ${
                          st.completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-700'
                        }`}
                      >
                        {st.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Actions */}
            <View className="flex-row gap-4 mt-4">
              {!isRunning && !isCompleted && (
                <Pressable onPress={() => startTask(task)}>
                  <Text className="text-green-600 font-bold">
                    ▶ Start
                  </Text>
                </Pressable>
              )}

              {isRunning && (
                <Pressable
                  onPress={() => pauseTask(task.id)}
                >
                  <Text className="text-yellow-700 font-bold">
                    ⏸ Pause
                  </Text>
                </Pressable>
              )}

              {!isCompleted && (
                <Pressable onPress={onToggle}>
                  <Text className="text-blue-600 font-bold">
                    ✓ Complete
                  </Text>
                </Pressable>
              )}
            </View>
          </RNAnimated.View>
        </Pressable>
      </Animated.View>
    </Swipeable>
  )
})
