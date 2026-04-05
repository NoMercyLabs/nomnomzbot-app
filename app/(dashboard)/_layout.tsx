import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Redirect, Tabs, Slot } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useChannel } from '@/hooks/useChannel'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import { useAppStore } from '@/stores/useAppStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { ChannelSwitcher } from '@/components/layout/ChannelSwitcher'
import { ConnectionStatus } from '@/components/layout/ConnectionStatus'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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
  const { isDesktop, isTablet } = useBreakpoint()
  const { setSidebarCollapsed } = useAppStore()

  useRealtimeChannel()

  // Spec: tablet sidebar starts collapsed on mount
  useEffect(() => {
    if (isTablet && !isDesktop) {
      setSidebarCollapsed(true)
    }
  }, [isTablet, isDesktop, setSidebarCollapsed])

  if (isLoading) return null

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />
  if (!currentChannel) return <Redirect href="/(auth)/onboarding" />

  // Web: full sidebar dashboard
  // Tablet: collapsible sidebar (no bottom tabs)
  if (isDesktop || isTablet) {
    return (
      <View className="flex-1 flex-row bg-surface">
        <Sidebar />
        <View className="flex-1">
          <View className="flex-row items-center justify-between border-b border-border px-6 py-3">
            <ChannelSwitcher />
            <ConnectionStatus />
          </View>
          <ErrorBoundary>
            <Slot />
          </ErrorBoundary>
        </View>
      </View>
    )
  }

  // Phone: bottom tabs with 5 key tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgb(17, 24, 39)',
          borderTopColor: 'rgb(75, 85, 99)',
        },
        tabBarActiveTintColor: 'rgb(124, 58, 237)', // accent-500 (--color-accent-500: 124 58 237)
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
      <Tabs.Screen name="timers" options={{ href: null }} />
      <Tabs.Screen name="my-data" options={{ href: null }} />
      <Tabs.Screen name="event-responses" options={{ href: null }} />
    </Tabs>
  )
}
