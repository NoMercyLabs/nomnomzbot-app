import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { TwitchLoginButton } from '@/features/auth/components/TwitchLoginButton'
import { useTwitchOAuth } from '@/features/auth/hooks/useTwitchOAuth'

export default function LoginScreen() {
  const { login, isLoading, error } = useTwitchOAuth()
  const { t } = useTranslation('common')

  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <View className="w-full max-w-sm items-center gap-8">
        {/* Branding */}
        <View className="items-center gap-3">
          <View className="w-20 h-20 rounded-2xl bg-surface-raised items-center justify-center">
            <Text className="text-4xl">🤖</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-100 tracking-tight">NomercyBot</Text>
          <Text className="text-gray-400 text-center text-base leading-relaxed">
            {t('auth.loginSubtitle', 'Your all-in-one Twitch stream bot.\nAutomate, moderate, and engage.')}
          </Text>
        </View>

        {/* Login area */}
        <View className="w-full gap-4">
          <TwitchLoginButton onPress={login} isLoading={isLoading} />

          {error ? (
            <View className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <Text className="text-xs text-gray-600 text-center">
          {t('auth.termsPrivacy', 'By signing in, you agree to our Terms of Service and Privacy Policy.')}
        </Text>
      </View>
    </View>
  )
}
