import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'

export default function ChatSettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Chat Settings" backHref="/(dashboard)/chat" />
      <View className="px-6 py-4">
      </View>
    </ScrollView>
  )
}
