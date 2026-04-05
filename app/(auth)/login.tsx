import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiClient } from '@/lib/api/client'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

export default function LoginScreen() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const setAuth = useAuthStore((s) => s.setAuth)

  async function handleTwitchLogin() {
    if (Platform.OS === 'web') {
      // Web: redirect to backend OAuth endpoint
      window.location.href = `${apiClient.defaults.baseURL?.replace('/api/v1', '') ?? ''}/auth/twitch`
    } else {
      // Native: open browser popup
      const result = await WebBrowser.openAuthSessionAsync(
        `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000'}/auth/twitch`,
        'nomercybot://callback',
      )
      if (result.type === 'success' && result.url) {
        const url = new URL(result.url)
        const token = url.searchParams.get('token')
        if (token) {
          // Exchange short-lived token with backend
          const res = await apiClient.post('/auth/exchange', { token })
          setAuth(res.data)
          router.replace('/(dashboard)')
        }
      }
    }
  }

  return (
    <View className="w-full max-w-sm rounded-2xl bg-surface-raised p-8 items-center gap-6">
      <View className="items-center gap-2">
        <Text className="text-3xl font-bold text-gray-100">NomercyBot</Text>
        <Text className="text-gray-400 text-center">
          {t('auth.loginSubtitle')}
        </Text>
      </View>

      <Pressable
        onPress={handleTwitchLogin}
        className="w-full flex-row items-center justify-center gap-3 rounded-xl bg-[#9147ff] py-4 px-6 active:opacity-80"
        accessibilityLabel={t('auth.login')}
        accessibilityRole="button"
      >
        <Text className="text-white font-semibold text-base">{t('auth.login')}</Text>
      </Pressable>

      <Text className="text-xs text-gray-500 text-center">
        {t('auth.termsPrivacy')}
      </Text>
    </View>
  )
}
