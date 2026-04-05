import { ActivityIndicator, View } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#9147ff" />
      </View>
    )
  }

  return <Redirect href={isAuthenticated ? '/(dashboard)' : '/(auth)/login'} />
}
