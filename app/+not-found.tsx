import { Link, Stack } from 'expo-router'
import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function NotFoundScreen() {
  const { t } = useTranslation('common')

  return (
    <>
      <Stack.Screen options={{ title: t('errors.notFound') }} />
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-2xl font-bold text-gray-100 mb-2">{t('errors.notFound')}</Text>
        <Text className="text-gray-400 mb-6">{t('errors.notFoundMessage')}</Text>
        <Link href="/(dashboard)" className="text-accent-400">
          {t('errors.goHome')}
        </Link>
      </View>
    </>
  )
}
