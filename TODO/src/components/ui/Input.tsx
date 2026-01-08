import { TextInput, TextInputProps } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

export function Input(props: TextInputProps) {
  const border = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor:
      border.value === 1 ? '#2563eb' : '#d1d5db',
  }))

  return (
    <Animated.View
      style={animatedStyle}
      className="border rounded-xl"
    >
      <TextInput
        {...props}
        onFocus={() => (border.value = withTiming(1))}
        onBlur={() => (border.value = withTiming(0))}
        className="px-4 py-3 text-base text-black"
        placeholderTextColor="#999"
      />
    </Animated.View>
  )
}
