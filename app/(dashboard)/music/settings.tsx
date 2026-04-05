import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'

export default function MusicSettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Music Settings" backHref="/(dashboard)/music" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
