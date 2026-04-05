import { View, Text, Pressable, ScrollView } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Terminal, Gift, MessageSquare, Shield, Music, Puzzle,
  Layers, Radio, Users, Link, Key, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react-native'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/(dashboard)', icon: <LayoutDashboard size={18} /> },
  { label: 'Commands', href: '/(dashboard)/commands', icon: <Terminal size={18} /> },
  { label: 'Rewards', href: '/(dashboard)/rewards', icon: <Gift size={18} /> },
  { label: 'Chat', href: '/(dashboard)/chat', icon: <MessageSquare size={18} /> },
  { label: 'Moderation', href: '/(dashboard)/moderation', icon: <Shield size={18} /> },
  { label: 'Music', href: '/(dashboard)/music', icon: <Music size={18} /> },
  { label: 'Pipelines', href: '/(dashboard)/pipelines', icon: <Puzzle size={18} /> },
  { label: 'Widgets', href: '/(dashboard)/widgets', icon: <Layers size={18} /> },
  { label: 'Stream', href: '/(dashboard)/stream', icon: <Radio size={18} /> },
  { label: 'Community', href: '/(dashboard)/community', icon: <Users size={18} /> },
  { label: 'Integrations', href: '/(dashboard)/integrations', icon: <Link size={18} /> },
  { label: 'Permissions', href: '/(dashboard)/permissions', icon: <Key size={18} /> },
  { label: 'Settings', href: '/(dashboard)/settings', icon: <Settings size={18} /> },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <View
      className={cn(
        'h-full border-r border-border bg-surface-raised flex flex-col transition-all',
        sidebarCollapsed ? 'w-16' : 'w-56',
      )}
    >
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
        {!sidebarCollapsed && (
          <Text className="text-gray-100 font-bold text-sm">NomercyBot</Text>
        )}
        <Pressable onPress={toggleSidebar} className="p-1 rounded-lg active:bg-surface-overlay ml-auto">
          {sidebarCollapsed
            ? <ChevronRight size={16} color="rgb(156,163,175)" />
            : <ChevronLeft size={16} color="rgb(156,163,175)" />
          }
        </Pressable>
      </View>

      <ScrollView className="flex-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as any)}
              className={cn(
                'flex-row items-center gap-3 mx-2 px-3 py-2.5 rounded-lg',
                isActive ? 'bg-accent-900' : 'active:bg-surface-overlay',
              )}
            >
              <View style={{ opacity: 1 }}>
                {item.icon}
              </View>
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
      </ScrollView>
    </View>
  )
}
