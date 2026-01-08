import { View } from 'react-native'
import Animated, {
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated'
import { Svg, Path } from 'react-native-svg'

export function SuccessCheck() {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="absolute inset-0 items-center justify-center bg-white/90"
    >
      <Animated.View entering={ZoomIn.springify()}>
        <Svg width={80} height={80} viewBox="0 0 24 24">
          <Path
            d="M20 6L9 17l-5-5"
            stroke="#16a34a"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  )
}
