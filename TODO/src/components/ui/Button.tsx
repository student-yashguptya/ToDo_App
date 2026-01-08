import { Pressable, Text } from 'react-native'

interface Props {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ title, onPress, variant = 'primary' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`p-4 rounded-xl ${
        variant === 'primary' ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <Text
        className={`text-center font-semibold ${
          variant === 'primary' ? 'text-white' : 'text-black'
        }`}
      >
        {title}
      </Text>
    </Pressable>
  )
}
