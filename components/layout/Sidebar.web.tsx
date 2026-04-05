import { View, Text, Pressable, ScrollView } from 'react-native'
import { usePathname, router } from 'expo-router'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Terminal, Gift, MessageSquare,
  Shield, Music, Globe, Users, Layers, Puzzle,
  Key, CreditCard, Database, Settings, PanelLeftClose,
} from 'lucide-react-native'

const NAV_ITEMS = [
  { href: '/(dashboard)', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/(dashboard)/commands', icon: Terminal, label: 'Commands' },
  { href: '/(dashboard)/rewards', icon: Gift, label: 'Rewards' },
  { href: '/(dashboard)/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/(dashboard)/moderation', icon: Shield, label: 'Moderation' },
  { href: '/(dashboard)/music', icon: Music, label: 'Music' },
  { href: '/(dashboard)/stream', icon: Globe, label: 'Stream Info' },
  { href: '/(dashboard)/community', icon: Users, label: 'Community' },
  { href: '/(dashboard)/widgets', icon: Layers, label: 'Widgets' },
  { href: '/(dashboard)/pipelines', icon: Puzzle, label: 'Pipelines' },
  { href: '/(dashboard)/integrations', icon: Key, label: 'Integrations' },
  { href: '/(dashboard)/permissions', icon: Shield, label: 'Permissions' },
] as const

const BOTTOM_ITEMS = [
  { href: '/(dashboard)/settings', icon: Settings, label: 'Settings' },
  { href: '/(dashboard)/billing', icon: CreditCard, label: 'Billing' },
  { href: '/(dashboard)/my-data', icon: Database, label: 'My Data' },
] as const

interface SidebarItemProps {
  href: string
  icon: any
  label: string
  isActive: boolean
  collapsed: boolean
}

function SidebarItem({ href, icon: Icon, label, isActive, collapsed }: SidebarItemProps) {
  return (
    <Pressable
      onPress={() => router.push(href as any)}
      className={cn(
        'mx-2 flex-row items-center gap-3 rounded-md px-3 py-2 active:bg-gray-800',
        isActive ? 'bg-accent-500/15' : '',
      )}
    >
      <Icon size={16} color={isActive ? '#a855f7' : '#6b7280'} />
      {!collapsed && (
        <Text className={cn('text-sm', isActive ? 'text-accent-400 font-medium' : 'text-gray-400')}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <View className={cn('h-full border-r border-gray-800 bg-gray-900', sidebarCollapsed ? 'w-14' : 'w-60')}>
      <View className="border-b border-gray-800 p-3">
        {!sidebarCollapsed && (
          <Text className="text-sm font-semibold text-white">NoMercy Bot</Text>
        )}
      </View>

      <ScrollView className="flex-1 py-2">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href || (item.href !== '/(dashboard)' && pathname.startsWith(item.href))}
            collapsed={sidebarCollapsed}
          />
        ))}
      </ScrollView>

      <View className="border-t border-gray-800 py-2">
        {BOTTOM_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname.startsWith(item.href)}
            collapsed={sidebarCollapsed}
          />
        ))}
        <Pressable
          onPress={toggleSidebar}
          className="mx-2 flex-row items-center gap-3 rounded-md px-3 py-2 active:bg-gray-800"
        >
          <PanelLeftClose size={16} color="#6b7280" style={sidebarCollapsed ? { transform: [{ scaleX: -1 }] } : undefined} />
          {!sidebarCollapsed && <Text className="text-sm text-gray-400">Collapse</Text>}
        </Pressable>
      </View>
    </View>
  )
}
