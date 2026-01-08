import { View, ActivityIndicator } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

export function Loader() {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-1 items-center justify-center bg-white"
    >
      <ActivityIndicator size="large" />
    </Animated.View>
  )
}
