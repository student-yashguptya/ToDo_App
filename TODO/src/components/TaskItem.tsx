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
  const { startTask, pauseTask, resumeTask } =
    useTasks()

  const isRunning = task.running
  const isCompleted =
    task.completed && task.remainingMs === 0

  const movedToTomorrow =
    !task.completed &&
    (task.remainingMs ?? 0) ===
      task.durationMinutes * 60_000 &&
    task.scheduledDate !==
      new Date().toISOString().slice(0, 10)

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

  /* ================================
     COLORS
  ================================ */
  const backgroundColor = isCompleted
    ? '#fee2e2' // 🔴 red
    : movedToTomorrow
    ? '#dcfce7' // 🟢 green
    : isRunning
    ? '#fef9c3' // 🟡 yellow
    : '#ffffff'

  const shadowColor = isCompleted
    ? '#ef4444'
    : movedToTomorrow
    ? '#22c55e'
    : '#facc15'

  /* ================================
     Swipe Delete
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
            <Text className="text-lg font-semibold">
              {task.title}
            </Text>

            <Text className="text-sm text-gray-500 mt-1">
              ⏱ {formatDuration(task.durationMinutes)}
            </Text>

            {!isCompleted && (
              <Text className="text-sm text-red-600 mt-1 font-semibold">
                ⏳ {formatMilliseconds(task.remainingMs ?? 0)}
              </Text>
            )}

            {isCompleted && (
              <Text className="text-sm font-bold text-red-600 mt-2">
                ✅ Completed
              </Text>
            )}

            {movedToTomorrow && (
              <Text className="text-sm font-bold text-green-700 mt-2">
                📅 Moved to Tomorrow
              </Text>
            )}

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

              <Pressable onPress={onToggle}>
                <Text className="text-blue-600 font-bold">
                  Done
                </Text>
              </Pressable>
            </View>
          </RNAnimated.View>
        </Pressable>
      </Animated.View>
    </Swipeable>
  )
})
