import { Pressable, Text } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

interface Props {
  title: string
  onPress: () => void
}

export function Button({ title, onPress }: Props) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onPress()
        }}
        className="bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-300"
      >
        <Text className="text-white font-bold text-base tracking-wide">
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  )
}
