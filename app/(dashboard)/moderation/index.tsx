import { ScrollView, View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Shield, Filter, Ban, ScrollText } from 'lucide-react-native'
import { Pressable } from 'react-native'

export default function ModerationScreen() {
  const router = useRouter()

  const sections = [
    { title: 'Auto-mod Filters', icon: <Filter size={20} color="rgb(124,58,237)" />, href: '/(dashboard)/moderation/filters' },
    { title: 'Ban List', icon: <Ban size={20} color="rgb(239,68,68)" />, href: '/(dashboard)/moderation/bans' },
    { title: 'Mod Log', icon: <ScrollText size={20} color="rgb(156,163,175)" />, href: '/(dashboard)/moderation/log' },
  ]

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Moderation" />
      <View className="px-6 py-4 gap-3">
        {sections.map((s) => (
          <Pressable key={s.title} onPress={() => router.push(s.href as any)}>
            <Card className="flex-row items-center gap-4 p-4">
              {s.icon}
              <Text className="text-gray-100 font-medium">{s.title}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
