import { Text, View, RefreshControl } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { Task } from '../types/task'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  refreshing: boolean
  onRefresh: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (next: Task[]) => void
  ListHeaderComponent?: React.ReactElement
}

export function TaskList({
  tasks,
  refreshing,
  onRefresh,
  onToggle,
  onDelete,
  onReorder,
  ListHeaderComponent,
}: Props) {
  if (tasks.length === 0 && !refreshing) {
    return (
      <Animated.View
        entering={FadeInUp.duration(400)}
        className="flex-1 items-center justify-center px-6"
      >
        <Text className="text-lg font-semibold text-gray-500 mb-1">
          No tasks yet
        </Text>
        <Text className="text-sm text-gray-400 text-center">
          Pull down to refresh or tap “Add” to get started 🚀
        </Text>
      </Animated.View>
    )
  }

  return (
    <DraggableFlatList
      data={tasks}
      keyExtractor={item => item.id}
      onDragEnd={({ data }) => onReorder(data)}
      ListHeaderComponent={ListHeaderComponent}
      activationDistance={12}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2563eb"
        />
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 40,
      }}
      renderItem={({ item, drag }) => (
        <ScaleDecorator>
          {/* ONLY ScaleDecorator here */}
          <TaskItem
            task={item}
            onToggle={() => onToggle(item.id)}
            onDelete={() => onDelete(item.id)}
            onLongPress={drag}
          />
        </ScaleDecorator>
      )}
    />
  )
}
