import { TextInput, TextInputProps } from 'react-native'

export function Input(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      className="border border-gray-300 rounded-xl px-4 py-3 text-base"
      placeholderTextColor="#999"
    />
  )
}
