import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiClient } from '@/lib/api/client'

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)

  async function handleTwitchLogin() {
    if (Platform.OS === 'web') {
      const base = apiClient.defaults.baseURL?.replace(/\/api.*/, '') ?? ''
      window.location.href = `${base}/auth/twitch`
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await login()
    } catch {
      setError('Failed to sign in with Twitch. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="w-full max-w-sm rounded-2xl bg-surface-raised p-8 items-center gap-6">
      {/* Header */}
      <View className="items-center gap-2">
        <View className="h-16 w-16 rounded-2xl bg-accent-600 items-center justify-center mb-1">
          <Text className="text-white text-3xl font-black">N</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-100">NomercyBot</Text>
        <Text className="text-gray-400 text-sm text-center">
          Sign in with Twitch to manage your stream bot
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View className="w-full rounded-xl bg-red-950 border border-red-800 px-4 py-3">
          <Text className="text-red-400 text-sm text-center">{error}</Text>
        </View>
      )}

      {/* Twitch login button */}
      <Pressable
        onPress={handleTwitchLogin}
        disabled={isLoading}
        className="w-full flex-row items-center justify-center gap-3 rounded-xl bg-[#9147ff] py-4 px-6 active:opacity-80 disabled:opacity-60"
      >
        {isLoading && <ActivityIndicator color="white" size="small" />}
        <Text className="text-white font-semibold text-base">
          {isLoading ? 'Signing in...' : 'Continue with Twitch'}
        </Text>
      </Pressable>

      <Text className="text-xs text-gray-600 text-center leading-5">
        By signing in you agree to our{' '}
        <Text className="text-gray-500">Terms of Service</Text> and{' '}
        <Text className="text-gray-500">Privacy Policy</Text>.
      </Text>
    </View>
  )
}
