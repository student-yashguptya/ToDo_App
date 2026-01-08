import { Pressable, Text } from 'react-native'

interface Props {
  title: string
  onPress: () => void
}

export function Button({ title, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-blue-600 py-3 rounded-xl items-center"
    >
      <Text className="text-white font-semibold text-base">
        {title}
      </Text>
    </Pressable>
  )
}
