import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'FOCUS_HISTORY'

export type FocusHistory = Record<string, number> // date -> seconds

export async function loadFocusHistory(): Promise<FocusHistory> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : {}
}

export async function saveFocusHistory(data: FocusHistory) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data))
}
