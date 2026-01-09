import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native'
import { useState } from 'react'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'

import { Input } from '../src/components/ui/Input'
import { Button } from '../src/components/ui/Button'
import { BackButton } from '../src/components/ui/BackButton'
import { SuccessCheck } from '../src/components/ui/SuccessCheck'
import { SubTaskEditor } from '../src/components/SubTaskEditor'
import { SubTask, TaskCategory } from '../src/types/task'
import { useTasks } from '../src/context/TaskContext'
import { ScrollView } from 'react-native-gesture-handler'

const CATEGORIES: { label: string; value: TaskCategory }[] = [
  { label: 'Personal Work', value: 'personal' },
  { label: 'Professional Work', value: 'professional' },
  { label: 'Study', value: 'study' },
]

type DurationMode = 'time' | 'days'

export default function AddTask({
  onClose,
}: {
  onClose: () => void
}) {
  const { addTask } = useTasks()

  const [title, setTitle] = useState('')

  // duration mode
  const [mode, setMode] = useState<DurationMode>('time')

  // time
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')

  // days
  const [days, setDays] = useState('')

  const [category, setCategory] =
    useState<TaskCategory>('personal')

  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    let totalMinutes = 0

    if (mode === 'time') {
      totalMinutes =
        Number(hours || 0) * 60 + Number(minutes || 0)
    } else {
      totalMinutes = Number(days || 0) * 24 * 60
    }

    if (!title.trim() || totalMinutes <= 0) return

    addTask(title.trim(), totalMinutes, category, subtasks)
    setSaved(true)

    setTimeout(onClose, 900)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView>
      <View className="bg-orange-50 flex-1">
        {saved && <SuccessCheck />}

        {/* HEADER */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="px-5 pt-2 pb-6"
        >
          <View className="flex-row items-center gap-3">
            <BackButton onPress={onClose} />

            <View>
              <Text className="text-2xl font-extrabold text-orange-600">
                Add Task
              </Text>
              <Text className="text-sm text-orange-400">
                Plan your focus intentionally
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* CARD */}
        <Animated.View
          entering={FadeInUp.delay(100)}
          className="mx-4 bg-white rounded-3xl px-5 py-6 shadow-xl shadow-orange-200"
        >
          {/* TITLE */}
          <Input
            placeholder="What do you want to work on?"
            value={title}
            onChangeText={setTitle}
          />

          {/* CATEGORY */}
          <View className="mt-4">
            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Category
            </Text>

            <View className="flex-row gap-2">
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-full border ${
                    category === cat.value
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-orange-100 border-orange-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      category === cat.value
                        ? 'text-white'
                        : 'text-orange-700'
                    }`}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* DURATION MODE */}
          <View className="mt-5">
            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Duration
            </Text>

            <View className="flex-row gap-2 mb-4">
              {(['time', 'days'] as const).map(m => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  className={`px-4 py-2 rounded-full border ${
                    mode === m
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-orange-100 border-orange-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      mode === m
                        ? 'text-white'
                        : 'text-orange-700'
                    }`}
                  >
                    {m === 'time' ? 'Time' : 'Days'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* TIME INPUT */}
            {mode === 'time' && (
              <View className="flex-row ">
                <Input
                  className="w-[48%]"
                  placeholder="Hours"
                  keyboardType="number-pad"
                  value={hours}
                  onChangeText={setHours}
                />
                <Input
                  className="w-[48%]"
                  placeholder="Minutes"
                  keyboardType="number-pad"
                  value={minutes}
                  onChangeText={setMinutes}
                />
              </View>
            )}

            {/* DAYS INPUT */}
            {mode === 'days' && (
              <Input
                placeholder="Number of days"
                keyboardType="number-pad"
                value={days}
                onChangeText={setDays}
              />
            )}
          </View>

          {/* SUBTASKS */}
          <View className="mt-4">
            <SubTaskEditor
              subtasks={subtasks}
              onChange={setSubtasks}
            />
          </View>

          {/* SAVE */}
          <View className="mt-8">
            <Button title="Save Task" onPress={handleSave} />
          </View>
        </Animated.View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
