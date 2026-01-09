import { View } from 'react-native'
import Animated, {
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated'
import { Svg, Path } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import { useEffect } from 'react'

export function SuccessCheck() {
  useEffect(() => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    )
  }, [])

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="
        absolute
        inset-0
        items-center
        justify-center
        bg-white/90
        z-50
      "
    >
      <Animated.View entering={ZoomIn.springify()}>
        <View className="bg-green-100 p-6 rounded-full">
          <Svg width={64} height={64} viewBox="0 0 24 24">
            <Path
              d="M20 6L9 17l-5-5"
              stroke="#16a34a"
              strokeWidth={2.8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </Animated.View>
    </Animated.View>
  )
}
