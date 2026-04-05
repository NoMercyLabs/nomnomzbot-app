import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useChannelStore } from '@/stores/useChannelStore'

export default function OnboardingScreen() {
  const router = useRouter()
  const { t } = useTranslation('common')
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
        <Text className="text-2xl font-bold text-gray-100">{t('auth.welcome')}</Text>
        <Text className="text-gray-400 text-center">
          {t('auth.setupDescription')}
        </Text>
      </View>

      <Pressable
        onPress={handleContinue}
        disabled={loading}
        className="w-full rounded-xl bg-accent-600 py-4 items-center active:opacity-80 disabled:opacity-50"
        accessibilityLabel={t('auth.continue')}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading, busy: loading }}
      >
        <Text className="text-white font-semibold">
          {loading ? t('status.loading') : t('auth.continue')}
        </Text>
      </Pressable>
    </View>
  )
}
