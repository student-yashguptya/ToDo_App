import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  title?: string
}

export function BackButton({ title }: Props) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        hitSlop={12}
        onPressIn={() => {
          scale.value = withSpring(0.92)
        }}
        onPressOut={() => {
          scale.value = withSpring(1)
        }}
        onPress={() => {
          Haptics.selectionAsync()
          router.back()
        }}
        className="flex-row items-center"
      >
        {/* Icon container */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{
            backgroundColor: '#fff',
            elevation: 4, // Android shadow
            shadowColor: '#000', // iOS shadow
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#f97316" // orange-500
          />
        </View>

        {/* Optional text */}
        {title && (
          <Text className="text-base font-semibold text-gray-800">
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  )
}
