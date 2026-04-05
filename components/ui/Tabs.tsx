import { View, Text, Pressable, ScrollView } from 'react-native'
import { cn } from '@/lib/utils/cn'

interface Tab {
  key: string
  label: string
  badge?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn('flex-row border-b border-gray-800', className)}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          className={cn(
            'flex-row items-center gap-1.5 border-b-2 px-4 py-3',
            activeTab === tab.key
              ? 'border-accent-500'
              : 'border-transparent',
          )}
        >
          <Text className={cn(
            'text-sm font-medium',
            activeTab === tab.key ? 'text-accent-400' : 'text-gray-500',
          )}>
            {tab.label}
          </Text>
          {tab.badge !== undefined && tab.badge > 0 && (
            <View className="rounded-full bg-accent-500/20 px-1.5 py-0.5">
              <Text className="text-xs text-accent-400">{tab.badge}</Text>
            </View>
          )}
        </Pressable>
      ))}
    </ScrollView>
  )
}
