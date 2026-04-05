// Reward detail is handled by app/(dashboard)/rewards/[rewardId].tsx
// This component is kept for potential future use in modal contexts.
import { View, Text } from 'react-native'
import { router } from 'expo-router'
import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'

export function RewardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  useEffect(() => {
    if (id) {
      router.replace(`/(dashboard)/rewards/${id}` as any)
    }
  }, [id])

  return <View className="flex-1 bg-gray-950" />
}
