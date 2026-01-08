import { Text, View, RefreshControl } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Task } from '../types/task'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  refreshing: boolean
  onRefresh: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (next: Task[]) => void
}

export function TaskList({
  tasks,
  refreshing,
  onRefresh,
  onToggle,
  onDelete,
  onReorder,
}: Props) {
  if (tasks.length === 0 && !refreshing) {
    return (
      <Animated.View
        entering={FadeInUp}
        className="flex-1 items-center justify-center"
      >
        <Text className="text-gray-400">
          No tasks yet. Pull down to refresh.
        </Text>
      </Animated.View>
    )
  }

  return (
    <DraggableFlatList
      data={tasks}
      keyExtractor={item => item.id}
      onDragEnd={({ data }) => onReorder(data)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item, drag }) => (
        <TaskItem
          task={item}
          onToggle={() => onToggle(item.id)}
          onDelete={() => onDelete(item.id)}
          onLongPress={drag}
        />
      )}
    />
  )
}
