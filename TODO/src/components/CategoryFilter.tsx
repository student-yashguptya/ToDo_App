import { ScrollView, Pressable, Text } from 'react-native'
import { Category } from '../types/category'

interface Props {
  categories: Category[]
  selected?: string
  onSelect: (id?: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-3">
      <Pressable
        onPress={() => onSelect(undefined)}
        className={`px-4 py-2 mr-2 rounded-full ${
          !selected ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <Text className={!selected ? 'text-white' : 'text-black'}>All</Text>
      </Pressable>

      {categories.map(cat => (
        <Pressable
          key={cat.id}
          onPress={() => onSelect(cat.id)}
          className={`px-4 py-2 mr-2 rounded-full ${
            selected === cat.id ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <Text className={selected === cat.id ? 'text-white' : 'text-black'}>
            {cat.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}
