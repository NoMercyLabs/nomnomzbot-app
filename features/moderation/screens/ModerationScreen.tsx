import { View, Text, ScrollView } from 'react-native'
import { useState } from 'react'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'

export function ModerationScreen() {
  const { t: tRaw } = useFeatureTranslation('moderation')
  const t = tRaw as (key: string) => string
  const [tab, setTab] = useState('automod')

  const tabs = [
    { key: 'automod', label: t('tabs.automod') },
    { key: 'banned', label: t('tabs.banned') },
    { key: 'log', label: t('tabs.log') },
  ]

  return (
    <View className="flex-1 bg-gray-950">
      <View className="px-4 pt-4">
        <PageHeader title={t('title')} />
      </View>
      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} className="px-2" />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        {tab === 'automod' && (
          <Card>
            <Text className="text-sm font-semibold text-white mb-3">{t('tabs.automod')}</Text>
            <Text className="text-sm text-gray-500">AutoMod settings coming soon.</Text>
          </Card>
        )}
        {tab === 'banned' && (
          <Card>
            <Text className="text-sm text-gray-500">No banned users.</Text>
          </Card>
        )}
        {tab === 'log' && (
          <Card>
            <Text className="text-sm text-gray-500">Mod log coming soon.</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  )
}
