import { View, Text, Pressable } from 'react-native'
import { ReactNode } from 'react'

interface Props {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ visible, title, onClose, children }: Props) {
  if (!visible) return null

  return (
    <View className="absolute inset-0 bg-black/40 justify-center items-center">
      <View className="bg-white w-11/12 rounded-2xl p-6">
        <Text className="text-lg font-semibold mb-4">{title}</Text>
        {children}
        <Pressable onPress={onClose} className="mt-4">
          <Text className="text-center text-blue-600 font-semibold">
            Close
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
