import { View, Text } from 'react-native'
import { CategoryFilter } from '../components/CategoryFilter'
import { useCategories } from '../hooks/useCategories'
import { useState } from 'react'

export default function FilterScreen() {
  const { categories } = useCategories()
  const [selected, setSelected] = useState<string | undefined>()

  return (
    <View className="flex-1 bg-white">
      <Text className="text-xl font-semibold p-4">
        Filter by Category
      </Text>

      <CategoryFilter
        categories={categories}
        selected={selected}
        onSelect={setSelected}
      />
    </View>
  )
}
