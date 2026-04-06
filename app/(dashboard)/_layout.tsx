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
      <View className="flex-1 flex-row" style={{ backgroundColor: '#0D0B1A' }}>
        <Sidebar />
        <View
          className="flex-1"
          style={{
            backgroundColor: '#141125',
            minWidth: 0,
            // Prevent content wider than viewport from causing character-by-character text wrap
            ...(Platform.OS === 'web' ? { overflowX: 'hidden' } as any : {}),
          }}
        >
          <View
            className="flex-row items-center justify-between px-6 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
          >
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

  // Phone: bottom tabs — exactly 5 visible, everything else hidden
  const HIDDEN_TAB = { tabBarButton: () => null }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0D1E',
          borderTopColor: '#1e1a35',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#5a5280',
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: -2,
        },
        tabBarItemStyle: {
          minHeight: 44,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={20} /> }}
      />
      <Tabs.Screen
        name="commands"
        options={{ title: 'Commands', tabBarIcon: ({ color }) => <Terminal color={color} size={20} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: 'Chat', tabBarIcon: ({ color }) => <MessageSquare color={color} size={20} /> }}
      />
      <Tabs.Screen
        name="music"
        options={{ title: 'Music', tabBarIcon: ({ color }) => <Music color={color} size={20} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'More', tabBarIcon: ({ color }) => <Settings color={color} size={20} /> }}
      />
      <Tabs.Screen name="rewards" options={HIDDEN_TAB} />
      <Tabs.Screen name="moderation" options={HIDDEN_TAB} />
      <Tabs.Screen name="widgets" options={HIDDEN_TAB} />
      <Tabs.Screen name="stream" options={HIDDEN_TAB} />
      <Tabs.Screen name="community" options={HIDDEN_TAB} />
      <Tabs.Screen name="pipelines" options={HIDDEN_TAB} />
      <Tabs.Screen name="integrations" options={HIDDEN_TAB} />
      <Tabs.Screen name="permissions" options={HIDDEN_TAB} />
      <Tabs.Screen name="billing" options={HIDDEN_TAB} />
      <Tabs.Screen name="features" options={HIDDEN_TAB} />
      <Tabs.Screen name="timers" options={HIDDEN_TAB} />
      <Tabs.Screen name="my-data" options={HIDDEN_TAB} />
      <Tabs.Screen name="event-responses" options={HIDDEN_TAB} />
      <Tabs.Screen name="admin" options={HIDDEN_TAB} />
    </Tabs>
  )
}
