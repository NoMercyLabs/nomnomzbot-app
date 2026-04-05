import { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiClient } from '@/lib/api/client'

export default function CallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ code?: string; state?: string; token?: string }>()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    async function handleCallback() {
      try {
        if (params.token) {
          // Direct token from native deep link
          const res = await apiClient.post('/auth/exchange', { token: params.token })
          setAuth(res.data)
        } else if (params.code) {
          // OAuth code flow (web)
          const res = await apiClient.post('/auth/twitch/callback', {
            code: params.code,
            state: params.state,
          })
          setAuth(res.data)
        }
        router.replace('/(dashboard)')
      } catch {
        router.replace('/(auth)/login')
      }
    }
    handleCallback()
  }, [])

  return (
    <View className="flex-1 items-center justify-center bg-surface gap-4">
      <ActivityIndicator size="large" color="rgb(124, 58, 237)" />
      <Text className="text-gray-400">Signing you in...</Text>
    </View>
  )
}
