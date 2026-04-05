import { View, Text, Pressable, ScrollView } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Terminal, Gift, MessageSquare, Shield, Music,
  Puzzle, Settings,
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
  { label: 'Settings', href: '/(dashboard)/settings', icon: <Settings size={18} /> },
]

export function SidebarNative() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <ScrollView className="flex-1 py-2 bg-surface-raised border-r border-border">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as any)}
            className={cn(
              'flex-row items-center gap-3 mx-2 px-3 py-2.5 rounded-lg',
              isActive ? 'bg-accent-900' : 'active:bg-surface-overlay',
            )}
          >
            {item.icon}
            <Text className={cn('text-sm font-medium', isActive ? 'text-accent-300' : 'text-gray-400')}>
              {item.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
