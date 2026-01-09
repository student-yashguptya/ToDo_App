import { View, TextInput, Pressable, Text } from 'react-native'
import { useState } from 'react'
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
  onChange: (next: SubTask[]) => void
}

export function SubTaskEditor({ subtasks, onChange }: Props) {
  const [text, setText] = useState('')
  const scale = useSharedValue(1)

  const addSubtask = () => {
    if (!text.trim()) return

    Haptics.selectionAsync()

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

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <View className="mt-6">
      {/* Title */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        Subtasks
      </Text>

      {/* Existing subtasks */}
      <View className="space-y-2 mb-3">
        {subtasks.map(st => (
          <Animated.View
            key={st.id}
            entering={FadeInUp.duration(250)}
            layout={Layout.springify()}
            className="flex-row items-center bg-orange-50 px-3 py-2 rounded-xl"
          >
            <View className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
            <Text className="text-sm text-gray-700 flex-1">
              {st.title}
            </Text>
          </Animated.View>
        ))}
      </View>

      {/* Input row */}
      <View className="flex-row items-center bg-white rounded-2xl border border-orange-200 px-3 py-2 shadow-sm">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a subtask…"
          placeholderTextColor="#9ca3af"
          className="flex-1 text-base text-gray-800 py-2"
        />

        <Animated.View style={buttonStyle}>
          <Pressable
            disabled={!text.trim()}
            onPressIn={() => (scale.value = withSpring(0.92))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={addSubtask}
            className={`ml-2 px-4 py-2 rounded-xl ${
              text.trim()
                ? 'bg-orange-500'
                : 'bg-orange-200'
            }`}
          >
            <Text className="text-white font-semibold">
              Add
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  )
}
