import { TextInput, TextInputProps } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

export function Input(props: TextInputProps) {
  const focused = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: focused.value
      ? '#f97316' // warm orange
      : '#e5e7eb',
    backgroundColor: focused.value
      ? '#fff7ed'
      : '#ffffff',
  }))

  return (
    <Animated.View
      style={animatedStyle}
      className="border rounded-2xl mb-2"
    >
      <TextInput
        {...props}
        onFocus={() => {
          focused.value = withTiming(1, { duration: 200 })
        }}
        onBlur={() => {
          focused.value = withTiming(0, { duration: 200 })
        }}
        className="px-4 py-3 text-base text-gray-900"
        placeholderTextColor="#9ca3af"
      />
    </Animated.View>
  )
}
