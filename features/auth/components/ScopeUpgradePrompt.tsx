import { View, Text, Pressable, Modal } from 'react-native'
import { ShieldCheck, X } from 'lucide-react-native'
import { useAuthStore } from '@/stores/useAuthStore'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:7000'

export function ScopeUpgradePrompt() {
  const pendingScopeUpgrade = useAuthStore((s) => s.pendingScopeUpgrade)
  const dismissScopeUpgrade = useAuthStore((s) => s.dismissScopeUpgrade)
  const isVisible = Array.isArray(pendingScopeUpgrade) && pendingScopeUpgrade.length > 0

  async function handleGrantAccess() {
    if (!pendingScopeUpgrade) return

    const scopeParam = encodeURIComponent(pendingScopeUpgrade.join(' '))

    if (Platform.OS === 'web') {
      const base = typeof window !== 'undefined' ? window.location.origin : API_URL
      window.location.href = `${base}/auth/twitch?scopes=${scopeParam}`
      return
    }

    const redirectUri = makeRedirectUri({ scheme: 'nomercybot', path: 'callback' })
    const authUrl = `${API_URL}/auth/twitch?scopes=${scopeParam}&redirect_uri=${encodeURIComponent(redirectUri)}`
    await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)
    dismissScopeUpgrade()
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={dismissScopeUpgrade}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm rounded-2xl bg-surface-raised p-6 gap-5">
          {/* Header */}
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-[#9147ff]/20 items-center justify-center">
                <ShieldCheck size={20} color="#9147ff" strokeWidth={2} />
              </View>
              <Text className="flex-1 text-lg font-bold text-gray-100">
                Additional Permissions Needed
              </Text>
            </View>
            <Pressable
              onPress={dismissScopeUpgrade}
              className="p-1 rounded-lg active:opacity-60"
              hitSlop={8}
            >
              <X size={18} color="#9ca3af" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Body */}
          <View className="gap-3">
            <Text className="text-gray-400 text-sm">
              This feature needs additional permissions to work:
            </Text>
            <View className="gap-1.5">
              {(pendingScopeUpgrade ?? []).map((scope) => (
                <View
                  key={scope}
                  className="flex-row items-center gap-2 rounded-lg bg-surface px-3 py-2"
                >
                  <View className="w-1.5 h-1.5 rounded-full bg-[#9147ff]" />
                  <Text className="text-gray-300 text-sm font-mono">{scope}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View className="gap-3">
            <Pressable
              onPress={handleGrantAccess}
              className="w-full flex-row items-center justify-center gap-2 rounded-xl bg-[#9147ff] py-3.5 active:opacity-80"
            >
              <Text className="text-white font-semibold">Grant Access</Text>
            </Pressable>
            <Pressable
              onPress={dismissScopeUpgrade}
              className="w-full items-center py-3 active:opacity-60"
            >
              <Text className="text-gray-400">Not now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
