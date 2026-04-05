import { View, Text, ScrollView, RefreshControl, Linking } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Music, ExternalLink, RefreshCw, Trash2 } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'

interface Integration {
  provider: string
  label: string
  description: string
  connected: boolean
  username?: string
  expiresAt?: string
  color: string
}

// Static metadata for display
const PROVIDER_META: Record<string, { label: string; description: string; color: string }> = {
  twitch: { label: 'Twitch', description: 'Chat bot, EventSub, Helix API', color: '#9146FF' },
  discord: { label: 'Discord', description: 'Notifications and commands bridge', color: '#5865F2' },
  spotify: { label: 'Spotify', description: 'Now playing and song requests', color: '#1DB954' },
  youtube: { label: 'YouTube Music', description: 'Song requests via YouTube', color: '#FF0000' },
  obs: { label: 'OBS Studio', description: 'Scene switching and source control', color: '#3F4254' },
  streamlabs: { label: 'Streamlabs', description: 'Alerts and donations', color: '#80F5D2' },
}

export default function IntegrationsScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: connections = [], isLoading, refetch, isRefetching } = useQuery<
    { provider: string; connected: boolean; username?: string; expiresAt?: string }[]
  >({
    queryKey: ['settings', 'connections', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/settings/connections`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  // Merge API data with static metadata for display
  const integrations: Integration[] = Object.entries(PROVIDER_META).map(([provider, meta]) => {
    const conn = connections.find((c) => c.provider === provider)
    return {
      provider,
      ...meta,
      connected: conn?.connected ?? false,
      username: conn?.username,
      expiresAt: conn?.expiresAt,
    }
  })

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const { data } = await apiClient.post<{ authUrl: string }>(
        `/api/${broadcasterId}/settings/connections/${provider}/auth`,
      )
      await Linking.openURL(data.authUrl)
    },
    onError: () => toast.error('Failed to initiate connection'),
  })

  const disconnectMutation = useMutation({
    mutationFn: (provider: string) =>
      apiClient.delete(`/api/${broadcasterId}/settings/connections/${provider}`).then((r) => r.data),
    onSuccess: (_, provider) => {
      qc.invalidateQueries({ queryKey: ['settings', 'connections', broadcasterId] })
      toast.success(`${PROVIDER_META[provider]?.label ?? provider} disconnected`)
    },
    onError: () => toast.error('Failed to disconnect'),
  })

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title="Integrations"
        subtitle={`${integrations.filter((i) => i.connected).length} connected`}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-3 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </View>
        ) : (
          integrations.map((integration) => (
            <Card key={integration.provider} className="gap-3">
              <View className="flex-row items-center gap-3">
                <View
                  className="h-10 w-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${integration.color}20` }}
                >
                  <Music size={18} color={integration.color} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-gray-100">{integration.label}</Text>
                  <Text className="text-xs text-gray-500">{integration.description}</Text>
                  {integration.username && (
                    <Text className="text-xs text-gray-600">@{integration.username}</Text>
                  )}
                </View>
                <Badge
                  variant={integration.connected ? 'success' : 'muted'}
                  label={integration.connected ? 'Connected' : 'Not connected'}
                />
              </View>
              <View className="flex-row gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => connectMutation.mutate(integration.provider)}
                  loading={connectMutation.isPending}
                  leftIcon={<RefreshCw size={12} color="#8889a0" />}
                  label={integration.connected ? 'Reconnect' : 'Connect'}
                />
                {integration.connected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => disconnectMutation.mutate(integration.provider)}
                    loading={disconnectMutation.isPending}
                    leftIcon={<Trash2 size={12} color="#ef4444" />}
                    label="Disconnect"
                  />
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  )
}
