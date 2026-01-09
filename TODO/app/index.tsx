import { View, Text, Pressable, Modal, Dimensions } from 'react-native'
import { useState } from 'react'
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Target } from 'lucide-react-native'

import { useTasks } from '../src/context/TaskContext'
import { TaskList } from '../src/components/TaskList'
import { ProgressBar } from '../src/components/ProgressBar'
import { Loader } from '../src/components/ui/Loader'
import { TotalDuration } from '../src/components/TotalDuration'
import { DailyFocusSummary } from '../src/components/DailyFocusSummary'
import { WeeklyFocusReport } from '../src/components/WeeklyFocusReport'
import AddTask from './add'
import EditTask from './edit'
import { Task } from '../src/types/task'

const { height } = Dimensions.get('window')
const SHEET_HEIGHT = height * 0.72

export default function Home() {
  const {
    tasks,
    loading,
    refreshing,
    toggleTask,
    deleteTask,
    refresh,
    reorderTasks,
  } = useTasks()

  const [addOpen, setAddOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const translateY = useSharedValue(SHEET_HEIGHT)

  const openSheet = () => {
    translateY.value = withSpring(0, {
      damping: 16,
      stiffness: 140,
    })
  }

  const closeSheet = (cb?: () => void) => {
    translateY.value = withSpring(
      SHEET_HEIGHT,
      { damping: 18 },
      () => cb && runOnJS(cb)()
    )
  }

  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      if (e.translationY > 0) {
        translateY.value = e.translationY
      }
    })
    .onEnd(e => {
      if (e.translationY > 120) {
        runOnJS(closeSheet)()
      } else {
        translateY.value = withSpring(0, {
          damping: 14,
          stiffness: 160,
        })
      }
    })

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (loading) return <Loader />

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={['#f8faff', '#eef2ff']} className="flex-1">
        <TaskList
          tasks={tasks}
          refreshing={refreshing}
          onRefresh={refresh}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onReorder={reorderTasks}
          onEdit={(task: Task) => {
            setEditTask(task)
            openSheet()
          }}
          ListHeaderComponent={
            <>
              <Animated.View
                entering={FadeInDown.duration(500)}
                className="px-5 pt-4 pb-4 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-3xl font-extrabold text-gray-900">
                    My Tasks
                  </Text>
                  <Text className="text-gray-500 mt-1">
                    Stay focused & consistent
                  </Text>
                </View>

                <View className="flex-row items-center gap-4">
                  <Pressable
                    onPress={() => {
                      setStatsOpen(true)
                      openSheet()
                    }}
                  >
                    <Target size={26} color="#2563eb" />
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setAddOpen(true)
                      openSheet()
                    }}
                    className="bg-blue-600 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">
                      + Add
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>

              <View className="px-4 gap-3 pb-6">
                <View className="bg-white rounded-2xl p-4 shadow-sm">
                  <TotalDuration tasks={tasks} />
                  <ProgressBar tasks={tasks} />
                </View>
              </View>
            </>
          }
        />

        {(addOpen || statsOpen || editTask) && (
          <Modal transparent animationType="none">
            <Pressable
              className="flex-1 bg-black/40"
              onPress={() => {
                closeSheet(() => {
                  setAddOpen(false)
                  setStatsOpen(false)
                  setEditTask(null)
                })
              }}
            />

            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[
                  {
                    height: SHEET_HEIGHT,
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    backgroundColor: 'white',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                  },
                  sheetStyle,
                ]}
              >
                <View className="items-center py-3">
                  <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </View>

                {addOpen && (
                  <AddTask
                    onClose={() =>
                      closeSheet(() => setAddOpen(false))
                    }
                  />
                )}

                {statsOpen && (
                  <View className="px-5 pb-10">
                    <Text className="text-xl font-bold mb-4">
                      Focus Stats
                    </Text>

                    <View className="gap-4">
                      <View className="bg-blue-50 rounded-2xl p-4">
                        <DailyFocusSummary />
                      </View>

                      <View className="bg-green-50 rounded-2xl p-4">
                        <WeeklyFocusReport />
                      </View>
                    </View>
                  </View>
                )}

                {editTask && (
                  <EditTask
                    task={editTask}
                    onClose={() =>
                      closeSheet(() => setEditTask(null))
                    }
                  />
                )}
              </Animated.View>
            </GestureDetector>
          </Modal>
        )}
      </LinearGradient>
    </SafeAreaView>
  )
}
