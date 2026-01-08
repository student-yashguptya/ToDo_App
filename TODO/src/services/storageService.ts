import AsyncStorage from '@react-native-async-storage/async-storage'

export const storageService = {
  async get<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },

  async set<T>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  }
}
