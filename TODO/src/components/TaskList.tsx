import { FlatList } from 'react-native'
import { Task } from '../types/task'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  onUpdate: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, onUpdate, onDelete }: Props) {
  return (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TaskItem
          task={item}
          onToggle={() => onUpdate({ ...item, completed: !item.completed })}
          onDelete={() => onDelete(item.id)}
        />
      )}
    />
  )
}
