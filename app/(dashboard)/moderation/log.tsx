import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'

export default function ModLogScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Mod Log" backHref="/(dashboard)/moderation" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
