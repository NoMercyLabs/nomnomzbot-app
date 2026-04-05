import { View, Text, Pressable, ScrollView } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Terminal, MessageSquare, Music, Clock,
  Users, Shield, Gift, Layers, Radio,
  Puzzle, Link, Key, Settings,
  CreditCard, Database, Zap,
  ChevronLeft, ChevronRight,
  type LucideIcon,
} from 'lucide-react-native'

interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/(dashboard)', Icon: LayoutDashboard },
      { label: 'Commands', href: '/(dashboard)/commands', Icon: Terminal },
      { label: 'Chat', href: '/(dashboard)/chat', Icon: MessageSquare },
      { label: 'Music', href: '/(dashboard)/music', Icon: Music },
      { label: 'Timers', href: '/(dashboard)/timers', Icon: Clock },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Community', href: '/(dashboard)/community', Icon: Users },
      { label: 'Moderation', href: '/(dashboard)/moderation', Icon: Shield },
      { label: 'Rewards', href: '/(dashboard)/rewards', Icon: Gift },
      { label: 'Widgets', href: '/(dashboard)/widgets', Icon: Layers },
      { label: 'Stream', href: '/(dashboard)/stream', Icon: Radio },
    ],
  },
  {
    title: 'Config',
    items: [
      { label: 'Pipelines', href: '/(dashboard)/pipelines', Icon: Puzzle },
      { label: 'Event Responses', href: '/(dashboard)/event-responses', Icon: Zap },
      { label: 'Integrations', href: '/(dashboard)/integrations', Icon: Link },
      { label: 'Permissions', href: '/(dashboard)/permissions', Icon: Key },
      { label: 'Settings', href: '/(dashboard)/settings', Icon: Settings },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Billing', href: '/(dashboard)/billing', Icon: CreditCard },
      { label: 'My Data', href: '/(dashboard)/my-data', Icon: Database },
    ],
  },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <View
      className={cn(
        'h-full border-r border-border bg-surface-raised flex flex-col transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header with brand name and collapse toggle */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
        {!sidebarCollapsed && (
          <Text className="text-gray-100 font-bold text-sm">NomercyBot</Text>
        )}
        <Pressable
          onPress={toggleSidebar}
          className="p-1 rounded-lg active:bg-surface-overlay ml-auto"
        >
          {sidebarCollapsed
            ? <ChevronRight size={16} color="rgb(156,163,175)" />
            : <ChevronLeft size={16} color="rgb(156,163,175)" />
          }
        </Pressable>
      </View>

      <ScrollView className="flex-1 py-2">
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <View key={section.title} className={cn(sectionIndex > 0 && 'mt-2')}>
            {/* Section label — hidden when collapsed */}
            {!sidebarCollapsed && (
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-1">
                {section.title}
              </Text>
            )}
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/(dashboard)' && pathname.startsWith(item.href + '/')) ||
                (item.href === '/(dashboard)' && (pathname === '/(dashboard)' || pathname === '/'))
              return (
                <Pressable
                  key={item.href}
                  onPress={() => router.push(item.href as any)}
                  className={cn(
                    'flex-row items-center gap-3 mx-2 px-3 py-2.5 rounded-lg',
                    isActive ? 'bg-accent-900' : 'active:bg-surface-overlay',
                    sidebarCollapsed && 'justify-center',
                  )}
                >
                  <item.Icon
                    size={18}
                    color={isActive ? 'rgb(167,139,250)' : 'rgb(156,163,175)'}
                  />
                  {!sidebarCollapsed && (
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-accent-300' : 'text-gray-400',
                      )}
                    >
                      {item.label}
                    </Text>
                  )}
                </Pressable>
              )
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
