import { Platform } from 'react-native'
import { Redirect, Tabs, Slot } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useChannel } from '@/hooks/useChannel'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import { Sidebar } from '@/components/layout/Sidebar'
import { ChannelSwitcher } from '@/components/layout/ChannelSwitcher'
import { ConnectionStatus } from '@/components/layout/ConnectionStatus'
import { View } from 'react-native'
import {
  LayoutDashboard,
  Terminal,
  MessageSquare,
  Music,
  Settings,
} from 'lucide-react-native'

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const { currentChannel } = useChannel()
  const { isDesktop } = useBreakpoint()

  useRealtimeChannel()

  if (isLoading) return null

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />
  if (!currentChannel) return <Redirect href="/(auth)/onboarding" />

  if (Platform.OS === 'web' || isDesktop) {
    return (
      <View className="flex-1 flex-row bg-surface">
        <Sidebar />
        <View className="flex-1">
          <View className="flex-row items-center justify-between border-b border-border px-6 py-3">
            <ChannelSwitcher />
            <ConnectionStatus />
          </View>
          <View className="flex-1">
            <Slot />
          </View>
        </View>
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgb(17, 24, 39)',
          borderTopColor: 'rgb(75, 85, 99)',
        },
        tabBarActiveTintColor: 'rgb(124, 58, 237)',
        tabBarInactiveTintColor: 'rgb(136, 137, 160)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="commands"
        options={{ title: 'Commands', tabBarIcon: ({ color, size }) => <Terminal color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="music"
        options={{ title: 'Music', tabBarIcon: ({ color, size }) => <Music color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'More', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
      />
      <Tabs.Screen name="rewards" options={{ href: null }} />
      <Tabs.Screen name="moderation" options={{ href: null }} />
      <Tabs.Screen name="widgets" options={{ href: null }} />
      <Tabs.Screen name="stream" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="pipelines" options={{ href: null }} />
      <Tabs.Screen name="integrations" options={{ href: null }} />
      <Tabs.Screen name="permissions" options={{ href: null }} />
      <Tabs.Screen name="billing" options={{ href: null }} />
      <Tabs.Screen name="my-data" options={{ href: null }} />
    </Tabs>
  )
}
