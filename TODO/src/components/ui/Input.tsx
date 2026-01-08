import { TextInput } from 'react-native'

export function Input(props: any) {
  return (
    <TextInput
      {...props}
      className="border border-gray-300 rounded-xl p-4 mb-3"
      placeholderTextColor="#999"
    />
  )
}
