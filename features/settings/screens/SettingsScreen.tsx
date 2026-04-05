import { View, Text, ScrollView, Pressable } from 'react-native'
import { useState } from 'react'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { useAuthStore } from '@/stores/useAuthStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useTranslation } from 'react-i18next'
import { loadNamespace } from '@/lib/i18n/resources'
import { LogOut } from 'lucide-react-native'

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Nederlands', value: 'nl' },
  { label: 'Deutsch', value: 'de' },
]

export function SettingsScreen() {
  const { t: tRaw } = useFeatureTranslation('settings')
  const t = tRaw as (key: string) => string
  const { i18n } = useTranslation()
  const [tab, setTab] = useState('general')
  const logout = useAuthStore((s) => s.logout)
  const { isDark, toggleTheme } = useThemeStore()

  const tabs = [
    { key: 'general', label: t('tabs.general') },
    { key: 'appearance', label: t('tabs.appearance') },
    { key: 'notifications', label: t('tabs.notifications') },
    { key: 'account', label: t('tabs.account') },
  ]

  async function changeLanguage(lang: string) {
    await loadNamespace(lang as any, 'common')
    await i18n.changeLanguage(lang)
  }

  return (
    <View className="flex-1 bg-gray-950">
      <View className="px-4 pt-4">
        <PageHeader title={t('title')} />
      </View>
      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} className="px-2" />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        {tab === 'general' && (
          <Card className="gap-4">
            <Select
              label={t('general.language')}
              value={i18n.language}
              onValueChange={changeLanguage}
              options={LANGUAGES}
            />
          </Card>
        )}

        {tab === 'appearance' && (
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-300">{t('appearance.theme')}</Text>
              <Toggle value={isDark} onValueChange={toggleTheme} />
            </View>
          </Card>
        )}

        {tab === 'account' && (
          <Card className="gap-4">
            <Button
              variant="outline"
              onPress={logout}
              leftIcon={<LogOut size={16} color="#9ca3af" />}
            >
              {t('account.logout')}
            </Button>
          </Card>
        )}
      </ScrollView>
    </View>
  )
}
