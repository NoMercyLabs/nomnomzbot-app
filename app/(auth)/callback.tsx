import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'

export default function CallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    code?: string
    state?: string
    token?: string
    scope?: string
    error?: string
    error_description?: string
  }>()

  const handleCallback = useAuthStore((s) => s.handleCallback)
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function processCallback() {
      // OAuth provider returned an error
      if (params.error) {
        const desc = params.error_description
          ? decodeURIComponent(params.error_description.replace(/\+/g, ' '))
          : params.error
        setErrorMessage(desc)
        return
      }

      if (!params.token && !params.code) {
        setErrorMessage('No authentication data received.')
        return
      }

      const success = await handleCallback({
        token: params.token,
        code: params.code,
        state: params.state,
        scopes: params.scope,
      })

      if (success) {
        if (onboardingComplete) {
          router.replace('/(dashboard)')
        } else {
          router.replace('/(auth)/onboarding')
        }
      } else {
        setErrorMessage('Authentication failed. Please try again.')
      }
    }

    processCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6 gap-6">
        <View className="w-full max-w-sm items-center gap-4">
          <Text className="text-2xl font-bold text-gray-100">Sign in failed</Text>
          <View className="w-full rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
            <Text className="text-red-400 text-sm text-center">{errorMessage}</Text>
          </View>
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            className="w-full rounded-xl bg-surface-raised py-4 items-center active:opacity-80"
          >
            <Text className="text-gray-100 font-semibold">Back to Login</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 items-center justify-center bg-surface gap-4">
      <ActivityIndicator size="large" color="#9147ff" />
      <Text className="text-gray-400">Signing you in...</Text>
    </View>
  )
}
