import { View, Text, ScrollView, Pressable, Linking } from 'react-native'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/useAuthStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { useChannelStore } from '@/stores/useChannelStore'
import { apiClient } from '@/lib/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { loadNamespace } from '@/lib/i18n/resources'
import {
  LogOut, ExternalLink, RefreshCw,
  Music, Trash2,
} from 'lucide-react-native'
import type { BotSettings } from '../types'

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Nederlands', value: 'nl' },
  { label: 'Deutsch', value: 'de' },
]

const TTS_VOICES = [
  { label: 'Default', value: 'default' },
  { label: 'Google US English', value: 'en-US-Standard-A' },
  { label: 'Google UK English', value: 'en-GB-Standard-A' },
  { label: 'Google German', value: 'de-DE-Standard-A' },
  { label: 'Amazon Polly - Joanna', value: 'polly-joanna' },
  { label: 'Amazon Polly - Matthew', value: 'polly-matthew' },
]

const MUSIC_PROVIDERS = [
  { id: 'spotify', label: 'Spotify', icon: Music, color: '#1DB954' },
  { id: 'youtube', label: 'YouTube Music', icon: Music, color: '#FF0000' },
]

interface OAuthConnection {
  provider: string
  connected: boolean
  username?: string
  scopes?: string[]
  expiresAt?: string
}

const SETTINGS_TABS = [
  { key: 'bot', label: 'Bot' },
  { key: 'connections', label: 'Connections' },
  { key: 'tts', label: 'TTS' },
  { key: 'music', label: 'Music' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'account', label: 'Account' },
]

export function SettingsScreen() {
  const { i18n } = useTranslation()
  const [tab, setTab] = useState('bot')
  const toast = useToast()
  const logout = useAuthStore((s) => s.logout)
  const { isDark, toggleTheme, accentOverride, setAccent } = useThemeStore()
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const qc = useQueryClient()

  const { data: settings, isLoading: settingsLoading } = useQuery<BotSettings>({
    queryKey: ['settings', broadcasterId],
    queryFn: () => apiClient.get(`/api/${broadcasterId}/settings`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const { data: connections = [] } = useQuery<OAuthConnection[]>({
    queryKey: ['settings', 'connections', broadcasterId],
    queryFn: () => apiClient.get(`/api/${broadcasterId}/settings/connections`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const settingsMutation = useMutation({
    mutationFn: (data: Partial<BotSettings>) =>
      apiClient.patch(`/api/${broadcasterId}/settings`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings', broadcasterId] })
      toast.success('Settings saved')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  async function patchSetting(key: keyof BotSettings, value: unknown) {
    await settingsMutation.mutateAsync({ [key]: value } as Partial<BotSettings>)
  }

  async function reconnectProvider(provider: string) {
    try {
      const { data } = await apiClient.post<{ authUrl: string }>(
        `/api/${broadcasterId}/settings/connections/${provider}/auth`,
      )
      await Linking.openURL(data.authUrl)
    } catch {
      toast.error(`Failed to connect ${provider}`)
    }
  }

  async function disconnectProvider(provider: string) {
    try {
      await apiClient.delete(`/api/${broadcasterId}/settings/connections/${provider}`)
      qc.invalidateQueries({ queryKey: ['settings', 'connections', broadcasterId] })
      toast.success(`${provider} disconnected`)
    } catch {
      toast.error(`Failed to disconnect ${provider}`)
    }
  }

  async function changeLanguage(lang: string) {
    await loadNamespace(lang as any, 'common')
    await i18n.changeLanguage(lang)
  }

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="Settings" />
      <Tabs tabs={SETTINGS_TABS} activeTab={tab} onTabChange={setTab} className="px-2" />

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">

        {/* Bot Settings */}
        {tab === 'bot' && (
          <>
            <Card className="gap-4">
              <Text className="text-sm font-semibold text-gray-300">Bot Configuration</Text>
              <Input
                label="Command Prefix"
                value={settings?.prefix ?? '!'}
                onChangeText={(v) => patchSetting('prefix', v)}
                autoCapitalize="none"
                maxLength={5}
                description="Prefix for all commands (e.g. !, /, ?)"
              />
              <Select
                label="Bot Language"
                value={settings?.language ?? 'en'}
                onValueChange={(v) => patchSetting('language', v)}
                options={LANGUAGES}
              />
            </Card>

            <Card className="gap-4">
              <Text className="text-sm font-semibold text-gray-300">Features</Text>
              <Toggle
                label="Moderation"
                description="Enable automated moderation features"
                value={settings?.enableModeration ?? false}
                onValueChange={(v) => patchSetting('enableModeration', v)}
              />
              <Toggle
                label="Music"
                description="Enable music queue and controls"
                value={settings?.enableMusic ?? false}
                onValueChange={(v) => patchSetting('enableMusic', v)}
              />
              <Toggle
                label="Pipelines"
                description="Enable automation pipelines"
                value={settings?.enablePipelines ?? false}
                onValueChange={(v) => patchSetting('enablePipelines', v)}
              />
              <Toggle
                label="Text-to-Speech"
                description="Read chat messages aloud via TTS"
                value={settings?.enableTts ?? false}
                onValueChange={(v) => patchSetting('enableTts', v)}
              />
            </Card>
          </>
        )}

        {/* OAuth Connections */}
        {tab === 'connections' && (
          <Card className="gap-4">
            <Text className="text-sm font-semibold text-gray-300">Connected Accounts</Text>
            {connections.length === 0 ? (
              <Text className="text-sm text-gray-500">No external connections configured.</Text>
            ) : (
              connections.map((conn) => (
                <View
                  key={conn.provider}
                  className="flex-row items-center gap-3 rounded-lg border border-border p-3"
                >
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-semibold text-gray-200 capitalize">
                        {conn.provider}
                      </Text>
                      {conn.connected ? (
                        <Badge variant="success" label="Connected" />
                      ) : (
                        <Badge variant="danger" label="Disconnected" />
                      )}
                    </View>
                    {conn.username && (
                      <Text className="text-xs text-gray-500">@{conn.username}</Text>
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => reconnectProvider(conn.provider)}
                      leftIcon={<RefreshCw size={13} color="#8889a0" />}
                      label="Reconnect"
                    />
                    {conn.connected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => disconnectProvider(conn.provider)}
                        leftIcon={<Trash2 size={13} color="#ef4444" />}
                        label="Disconnect"
                      />
                    )}
                  </View>
                </View>
              ))
            )}

            <View className="border-t border-border pt-3">
              <Text className="text-xs font-semibold uppercase text-gray-500 mb-3">Add Connection</Text>
              <View className="gap-2">
                <Button
                  variant="secondary"
                  onPress={() => reconnectProvider('twitch')}
                  leftIcon={<ExternalLink size={14} color="#9146FF" />}
                  label="Connect Twitch Account"
                />
                <Button
                  variant="secondary"
                  onPress={() => reconnectProvider('spotify')}
                  leftIcon={<Music size={14} color="#1DB954" />}
                  label="Connect Spotify"
                />
              </View>
            </View>
          </Card>
        )}

        {/* TTS */}
        {tab === 'tts' && (
          <>
            <Card className="gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-200">Text-to-Speech</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Read chat messages aloud in your stream
                  </Text>
                </View>
                <Toggle
                  value={settings?.enableTts ?? false}
                  onValueChange={(v) => patchSetting('enableTts', v)}
                />
              </View>
            </Card>

            <Card className="gap-4">
              <Text className="text-sm font-semibold text-gray-300">Voice Settings</Text>
              <Select
                label="Voice"
                value={settings?.ttsVoice ?? 'default'}
                onValueChange={(v) => patchSetting('ttsVoice', v)}
                options={TTS_VOICES}
              />
              <Input
                label="Volume (0–100)"
                value={String(settings?.ttsVolume ?? 80)}
                onChangeText={(v) => patchSetting('ttsVolume', parseInt(v, 10) || 80)}
                keyboardType="numeric"
                description="TTS output volume level"
              />
            </Card>

            <Card className="gap-3">
              <Text className="text-sm font-semibold text-gray-300">Filters</Text>
              <Text className="text-xs text-gray-500">
                Control which messages are read aloud.
              </Text>
              <Toggle
                label="Skip commands"
                description="Don't read messages starting with the command prefix"
                value
                onValueChange={() => {}}
              />
              <Toggle
                label="Skip links"
                description="Don't read URLs in messages"
                value
                onValueChange={() => {}}
              />
              <Toggle
                label="Subscribers only"
                description="Only read messages from subscribers"
                value={false}
                onValueChange={() => {}}
              />
            </Card>
          </>
        )}

        {/* Music Providers */}
        {tab === 'music' && (
          <>
            <Card className="gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-200">Music Integration</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Allow viewers to request songs via chat
                  </Text>
                </View>
                <Toggle
                  value={settings?.enableMusic ?? false}
                  onValueChange={(v) => patchSetting('enableMusic', v)}
                />
              </View>
            </Card>

            <Card className="gap-4">
              <Text className="text-sm font-semibold text-gray-300">Providers</Text>
              {MUSIC_PROVIDERS.map((provider) => {
                const conn = connections.find((c) => c.provider === provider.id)
                return (
                  <View
                    key={provider.id}
                    className="flex-row items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <View
                      className="h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${provider.color}20` }}
                    >
                      <provider.icon size={18} color={provider.color} />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text className="text-sm font-medium text-gray-200">{provider.label}</Text>
                      {conn?.username && (
                        <Text className="text-xs text-gray-500">@{conn.username}</Text>
                      )}
                    </View>
                    {conn?.connected ? (
                      <Badge variant="success" label="Connected" />
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onPress={() => reconnectProvider(provider.id)}
                        label="Connect"
                      />
                    )}
                  </View>
                )
              })}
            </Card>

            <Card className="gap-4">
              <Text className="text-sm font-semibold text-gray-300">Request Settings</Text>
              <Toggle
                label="Allow song requests"
                description="Viewers can add songs to the queue with !sr"
                value={settings?.enableMusic ?? false}
                onValueChange={(v) => patchSetting('enableMusic', v)}
              />
              <Toggle
                label="Subscriber only"
                description="Restrict song requests to subscribers"
                value={false}
                onValueChange={() => {}}
              />
            </Card>
          </>
        )}

        {/* Appearance */}
        {tab === 'appearance' && (
          <>
            <Card className="gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-200">Dark Mode</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Use dark interface theme</Text>
                </View>
                <Toggle value={isDark} onValueChange={toggleTheme} />
              </View>
            </Card>

            <Card className="gap-4">
              <Text className="text-sm font-semibold text-gray-300">Accent Color</Text>
              <Text className="text-xs text-gray-500">
                Set your brand color — used for highlights, buttons, and indicators.
              </Text>
              <ColorPicker
                value={accentOverride ?? '#9146FF'}
                onValueChange={setAccent}
              />
            </Card>

            <Card className="gap-4">
              <Text className="text-sm font-semibold text-gray-300">Language</Text>
              <Select
                label="Interface Language"
                value={i18n.language}
                onValueChange={changeLanguage}
                options={LANGUAGES}
              />
            </Card>
          </>
        )}

        {/* Account */}
        {tab === 'account' && (
          <Card className="gap-4">
            <Text className="text-sm font-semibold text-gray-300">Account</Text>
            <Button
              variant="outline"
              onPress={logout}
              leftIcon={<LogOut size={16} color="#9ca3af" />}
              label="Sign Out"
            />
          </Card>
        )}
      </ScrollView>
    </View>
  )
}
