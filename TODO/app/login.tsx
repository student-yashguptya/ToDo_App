import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Target } from 'lucide-react-native'

import { authApi, getStoredToken } from '../src/services/api'
import { Input } from '../src/components/ui/Input'

export default function LoginScreen() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  const submittingRef = useRef(false)

  // --------------------
  // Auto-login (safe)
  // --------------------
  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const token = await getStoredToken()
        if (mounted && token) {
          router.replace('/')
        }
      } catch (e) {
        console.log('Token restore failed:', e)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  // --------------------
  // Submit handler
  // --------------------
  const handleSubmit = async () => {
    if (loading || submittingRef.current) return

    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password')
      return
    }

    submittingRef.current = true
    setLoading(true)

    try {
      console.log('AUTH START', { isRegister })

      if (isRegister) {
        await authApi.register(username.trim(), password)
        console.log('REGISTER SUCCESS')
      } else {
        await authApi.login(username.trim(), password)
        console.log('LOGIN SUCCESS')
      }

      router.replace('/')
    } catch (error: any) {
      console.log('AUTH ERROR', error)
      Alert.alert(
        'Error',
        error?.message || 'Authentication failed'
      )
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  // --------------------
  // UI
  // --------------------
  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#E6F4FE', '#FFFFFF']}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="items-center mb-12">
              <View className="bg-blue-500 rounded-full p-4 mb-4">
                <Target size={48} color="white" />
              </View>

              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Task Manager
              </Text>

              <Text className="text-gray-600 text-center">
                {isRegister
                  ? 'Create your account to get started'
                  : 'Sign in to continue'}
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Username
                </Text>
                <Input
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  onSubmitEditing={handleSubmit}
                />
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={`mt-6 py-4 rounded-2xl items-center ${
                  loading
                    ? 'bg-gray-400'
                    : 'bg-orange-500 shadow-lg shadow-orange-300'
                }`}
              >
                <Text className="text-white font-semibold text-lg">
                  {loading
                    ? 'Please wait...'
                    : isRegister
                      ? 'Create Account'
                      : 'Sign In'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => !loading && setIsRegister(!isRegister)}
                className="mt-4"
              >
                <Text className="text-center text-blue-600">
                  {isRegister
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Register"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}
