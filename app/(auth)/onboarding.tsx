import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiClient } from '@/lib/api/client'

export default function OnboardingScreen() {
  const router = useRouter()
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)

  const [showAddChannel, setShowAddChannel] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAddChannel() {
    const name = channelName.trim()
    if (!name) {
      setError('Please enter a channel name.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiClient.post('/api/v1/channels', { name })
      completeOnboarding()
      router.replace('/(dashboard)')
    } catch (e: any) {
      const message: string =
        e?.response?.data?.message ??
        e?.message ??
        'Failed to add channel. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    completeOnboarding()
    router.replace('/(dashboard)')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <ScrollView
        contentContainerClassName="flex-1 items-center justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center gap-3 mb-10">
          <Text className="text-4xl font-bold text-gray-100">Welcome!</Text>
          <Text className="text-base text-gray-400 text-center leading-relaxed max-w-xs">
            Connect your Twitch channel to get started with NoMercy Bot.
          </Text>
        </View>

        {/* Card */}
        <View className="w-full max-w-sm rounded-2xl bg-surface-raised p-6 gap-4">
          {!showAddChannel ? (
            /* Initial state — prompt to add a channel */
            <>
              <View className="gap-1">
                <Text className="text-lg font-semibold text-gray-100">
                  Add your channel
                </Text>
                <Text className="text-sm text-gray-400">
                  Enter your Twitch channel name so the bot knows where to work.
                </Text>
              </View>

              <Pressable
                onPress={() => setShowAddChannel(true)}
                className="w-full rounded-xl bg-accent-600 py-4 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold text-base">
                  Add Channel
                </Text>
              </Pressable>
            </>
          ) : (
            /* Add channel form */
            <>
              <View className="gap-1">
                <Text className="text-lg font-semibold text-gray-100">
                  Twitch channel name
                </Text>
                <Text className="text-sm text-gray-400">
                  Enter exactly as it appears on Twitch (case-insensitive).
                </Text>
              </View>

              <TextInput
                value={channelName}
                onChangeText={(t) => {
                  setChannelName(t)
                  setError(null)
                }}
                placeholder="e.g. nomercylabs"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleAddChannel}
                className="w-full rounded-xl bg-surface border border-white/10 px-4 py-3 text-gray-100 text-base"
              />

              {error ? (
                <View className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
                  <Text className="text-red-400 text-sm">{error}</Text>
                </View>
              ) : null}

              <View className="gap-2">
                <Pressable
                  onPress={handleAddChannel}
                  disabled={loading}
                  className="w-full rounded-xl bg-accent-600 py-4 items-center active:opacity-80 disabled:opacity-50"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Connect Channel
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => {
                    setShowAddChannel(false)
                    setChannelName('')
                    setError(null)
                  }}
                  className="w-full rounded-xl bg-surface py-3 items-center active:opacity-80"
                >
                  <Text className="text-gray-400 font-medium">Back</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* Skip */}
        <Pressable
          onPress={handleSkip}
          className="mt-8 px-4 py-2 active:opacity-60"
        >
          <Text className="text-gray-500 text-sm underline">
            Skip for now
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
