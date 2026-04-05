import { useEffect } from 'react'
import { View } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiClient } from '@/lib/api/client'
import { Skeleton } from '@/components/ui/Skeleton'
import { Text } from 'react-native'

export default function CallbackScreen() {
  const router = useRouter()
  const { t } = useTranslation('common')
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
    <View className="flex-1 items-center justify-center bg-surface gap-6">
      <View className="gap-3 items-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-40 rounded-lg" />
      </View>
      <Text className="text-gray-400 text-sm">{t('auth.signingIn')}</Text>
    </View>
  )
}
