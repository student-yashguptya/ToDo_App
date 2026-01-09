import { Text, View, RefreshControl } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist'
import { Task } from '../types/task'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  refreshing: boolean
  onRefresh: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (next: Task[]) => void
  onEdit: (task: Task) => void
  ListHeaderComponent?: React.ReactElement
}

export function TaskList({
  tasks,
  refreshing,
  onRefresh,
  onToggle,
  onDelete,
  onReorder,
  onEdit,
  ListHeaderComponent,
}: Props) {
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
        flexGrow: tasks.length === 0 ? 1 : undefined,
      }}
      ListEmptyComponent={
        !refreshing ? (
          <Animated.View
            entering={FadeInUp.duration(400)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingTop: 80,
            }}
          >
            <Text className="text-lg font-semibold text-gray-500 mb-1">
              No tasks yet
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Pull down to refresh or tap “Add” to get started 🚀
            </Text>
          </Animated.View>
        ) : null
      }
      renderItem={({ item, drag }) => (
        <ScaleDecorator>
          <TaskItem
            task={item}
            onToggle={() => onToggle(item.id)}
            onDelete={() => onDelete(item.id)}
            onLongPress={drag}
            onEdit={() => onEdit(item)}
          />
        </ScaleDecorator>
      )}
    />
  )
}
