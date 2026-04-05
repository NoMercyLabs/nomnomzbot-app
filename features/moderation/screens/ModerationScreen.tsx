import { View, ScrollView, Pressable } from 'react-native'
import { router } from 'expo-router'
import { Filter, Ban, ScrollText } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Text } from 'react-native'
import { ChevronRight } from 'lucide-react-native'

const SECTIONS = [
  {
    title: 'Auto-mod Filters',
    description: 'Configure automatic moderation rules',
    icon: Filter,
    color: '#a855f7',
    href: '/(dashboard)/moderation/filters',
  },
  {
    title: 'Ban List',
    description: 'View and manage active bans',
    icon: Ban,
    color: '#ef4444',
    href: '/(dashboard)/moderation/bans',
  },
  {
    title: 'Mod Log',
    description: 'History of moderation actions',
    icon: ScrollText,
    color: '#9ca3af',
    href: '/(dashboard)/moderation/log',
  },
]

export function ModerationScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-3">
      <PageHeader title="Moderation" />
      {SECTIONS.map((s) => {
        const Icon = s.icon
        return (
          <Pressable key={s.title} onPress={() => router.push(s.href as any)} className="active:opacity-70">
            <Card className="flex-row items-center gap-3">
              <View
                className="h-10 w-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${s.color}20` }}
              >
                <Icon size={18} color={s.color} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-gray-100">{s.title}</Text>
                <Text className="text-xs text-gray-500">{s.description}</Text>
              </View>
              <ChevronRight size={16} color="#5a5b72" />
            </Card>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
