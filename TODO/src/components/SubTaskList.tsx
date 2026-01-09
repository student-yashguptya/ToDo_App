import { View, Text, Pressable, TextInput } from 'react-native'
import { useState } from 'react'
import { Swipeable } from 'react-native-gesture-handler'
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import Animated, {
  FadeInUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { SubTask } from '../types/task'

interface Props {
  subtasks: SubTask[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (next: SubTask[]) => void
  onEdit: (id: string, title: string) => void
}

export function SubTaskList({
  subtasks,
  onToggle,
  onDelete,
  onReorder,
  onEdit,
}: Props) {
  if (subtasks.length === 0) return null

  const completed = subtasks.filter(s => s.completed).length
  const percent = Math.round(
    (completed / subtasks.length) * 100
  )

  return (
    <View className="mt-3">
      {/* Progress bar */}
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3 ml-2">
        <Animated.View
          className="h-full bg-emerald-500"
          style={{ width: `${percent}%` }}
        />
      </View>

      <DraggableFlatList
        data={subtasks}
        keyExtractor={item => item.id}
        onDragEnd={({ data }) => onReorder(data)}
        activationDistance={10}
        renderItem={({ item, drag }) => (
          <ScaleDecorator>
            <Animated.View
              layout={Layout.springify()}
              entering={FadeInUp.duration(250)}
            >
              <Swipeable
                renderRightActions={() => (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Medium
                      )
                      onDelete(item.id)
                    }}
                    className="bg-red-500 rounded-xl px-4 justify-center"
                  >
                    <Text className="text-white font-bold">
                      Delete
                    </Text>
                  </Pressable>
                )}
              >
                <SubTaskRow
                  subtask={item}
                  allSubtasks={subtasks}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onLongPress={drag}
                />
              </Swipeable>
            </Animated.View>
          </ScaleDecorator>
        )}
      />
    </View>
  )
}

/* ---------------------------------- */
/* Individual row */
/* ---------------------------------- */

function SubTaskRow({
  subtask,
  allSubtasks,
  onToggle,
  onEdit,
  onLongPress,
}: {
  subtask: SubTask
  allSubtasks: SubTask[]
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onLongPress: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(subtask.title)

  const checkboxStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(subtask.completed ? 1.1 : 1) },
    ],
    backgroundColor: subtask.completed
      ? '#10b981'
      : '#fff',
  }))

  const commitEdit = () => {
    const next = text.trim()

    // ❌ empty title → revert
    if (!next) {
      setText(subtask.title)
      setEditing(false)
      return
    }

    // ❌ duplicate title → revert
    if (
      allSubtasks.some(
        s =>
          s.id !== subtask.id &&
          s.title.toLowerCase() ===
            next.toLowerCase()
      )
    ) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      )
      setText(subtask.title)
      setEditing(false)
      return
    }

    onEdit(subtask.id, next)
    setEditing(false)
  }

  return (
    <Pressable
      onLongPress={!editing ? onLongPress : undefined}
      className="flex-row items-center bg-white px-3 py-3 rounded-2xl mb-2 shadow-sm"
    >
      {/* Checkbox */}
      <Animated.View
        style={checkboxStyle}
        className="w-5 h-5 rounded-md border border-gray-400 mr-3 items-center justify-center"
      >
        {subtask.completed && (
          <Text className="text-white text-xs font-bold">
            ✓
          </Text>
        )}
      </Animated.View>

      {/* Title */}
      {editing ? (
        <TextInput
          value={text}
          autoFocus
          onChangeText={setText}
          onBlur={commitEdit}
          onSubmitEditing={commitEdit}
          returnKeyType="done"
          className="flex-1 text-sm text-gray-800"
        />
      ) : (
        <Pressable
          onPress={() => {
            Haptics.selectionAsync()
            onToggle(subtask.id)
          }}
          onLongPress={() => setEditing(true)}
          className="flex-1"
        >
          <Text
            className={`text-sm ${
              subtask.completed
                ? 'line-through text-gray-400'
                : 'text-gray-800'
            }`}
          >
            {subtask.title}
          </Text>
        </Pressable>
      )}
    </Pressable>
  )
}
