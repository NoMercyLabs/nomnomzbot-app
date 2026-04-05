import { useState } from 'react'
import { View, Text, Pressable, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { useChannelStore } from '@/stores/useChannelStore'

export default function OnboardingScreen() {
  const router = useRouter()
  const fetchChannels = useChannelStore((s) => s.fetchChannels)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    setLoading(true)
    try {
      await fetchChannels()
      router.replace('/(dashboard)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="w-full max-w-sm rounded-2xl bg-surface-raised p-8 items-center gap-6">
      <View className="items-center gap-2">
        <Text className="text-2xl font-bold text-gray-100">Welcome!</Text>
        <Text className="text-gray-400 text-center">
          Let's get your bot set up. We'll load your channel automatically.
        </Text>
      </View>

      <Pressable
        onPress={handleContinue}
        disabled={loading}
        className="w-full rounded-xl bg-accent-600 py-4 items-center active:opacity-80 disabled:opacity-50"
      >
        <Text className="text-white font-semibold">
          {loading ? 'Loading...' : 'Continue'}
        </Text>
      </Pressable>
    </View>
  )
}
