import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'

export default function FiltersScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Auto-mod Filters" backHref="/(dashboard)/moderation" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
