import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Puzzle, Link, Link2Off, CheckCircle2, Clock } from 'lucide-react-native'
import { ErrorState } from '@/components/ui/ErrorState'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout'

interface Integration {
  id: string
  name: string
  description: string
  connected: boolean
  connectedAs?: string
  oauthUrl?: string
  category: string
  lastSync?: string
}

interface IntegrationsResponse {
  integrations: Integration[]
}

const INTEGRATION_META: Record<string, {
  category: string
  description: string
  scopes?: string[]
  color: string
}> = {
  spotify: {
    category: 'Music',
    description: 'Now playing overlays and song request commands',
    scopes: ['user-read-playback-state', 'user-modify-playback-state'],
    color: '#1DB954',
  },
  discord: {
    category: 'Social',
    description: 'Cross-post alerts and notifications to Discord',
    scopes: ['bot', 'webhook'],
    color: '#5865F2',
  },
  youtube: {
    category: 'Video',
    description: 'YouTube live stream management and stats',
    scopes: ['youtube.readonly'],
    color: '#FF0000',
  },
  obs: {
    category: 'Streaming',
    description: 'Scene switching, sources, and OBS remote control',
    scopes: ['websocket'],
    color: '#302E31',
  },
  twitch: {
    category: 'Platform',
    description: 'Primary Twitch account — always connected',
    scopes: ['channel:read:subscriptions', 'chat:edit'],
    color: '#9146FF',
  },
}

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  isLoading,
}: {
  integration: Integration
  onConnect: (id: string, oauthUrl?: string) => void
  onDisconnect: (id: string) => void
  isLoading: boolean
}) {
  const meta = INTEGRATION_META[integration.id.toLowerCase()] ?? {
    category: integration.category,
    description: integration.description,
    color: '#5a5280',
  }
  const isPrimary = integration.id.toLowerCase() === 'twitch'
  const accentColor = meta.color

  return (
    <View
      className="rounded-xl p-4 gap-3"
      style={{
        backgroundColor: '#1A1530',
        borderWidth: 1,
        borderColor: integration.connected ? 'rgba(34,197,94,0.25)' : '#1e1a35',
      }}
    >
      {/* Header */}
      <View className="flex-row items-start gap-3">
        <View
          className="h-10 w-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Puzzle size={18} color={accentColor} />
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-white">{integration.name}</Text>
            <View
              className="px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#231D42' }}
            >
              <Text className="text-xs" style={{ color: '#5a5280' }}>{meta.category}</Text>
            </View>
          </View>
          <Text className="text-xs" style={{ color: '#5a5280' }} numberOfLines={2}>{meta.description}</Text>
        </View>
      </View>

      {/* Scopes */}
      {meta.scopes && (
        <View className="flex-row flex-wrap gap-1.5">
          {meta.scopes.map((scope) => (
            <View
              key={scope}
              className="px-2 py-0.5 rounded"
              style={{ backgroundColor: '#231D42' }}
            >
              <Text className="text-xs font-mono" style={{ color: '#3d3566' }}>{scope}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Status + action */}
      <View className="flex-row items-center justify-between" style={{ borderTopWidth: 1, borderTopColor: '#1e1a35', paddingTop: 10 }}>
        <View className="flex-row items-center gap-1.5">
          {integration.connected ? (
            <>
              <CheckCircle2 size={13} color="#22c55e" />
              <Text className="text-xs font-medium" style={{ color: '#22c55e' }}>
                {integration.connectedAs ? `Connected as ${integration.connectedAs}` : 'Connected'}
              </Text>
            </>
          ) : (
            <>
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3d3566' }} />
              <Text className="text-xs" style={{ color: '#5a5280' }}>Not connected</Text>
            </>
          )}
          {integration.lastSync && (
            <View className="flex-row items-center gap-1 ml-2">
              <Clock size={10} color="#3d3566" />
              <Text className="text-xs" style={{ color: '#3d3566' }}>{integration.lastSync}</Text>
            </View>
          )}
        </View>

        {isPrimary ? null : integration.connected ? (
          <Button
            size="sm"
            variant="ghost"
            label="Disconnect"
            leftIcon={<Link2Off size={11} color="#f87171" />}
            loading={isLoading}
            onPress={() => onDisconnect(integration.id)}
          />
        ) : (
          <Button
            size="sm"
            variant="outline"
            label="Configure"
            leftIcon={<Link size={11} color="#d1d5db" />}
            loading={isLoading}
            onPress={() => onConnect(integration.id, integration.oauthUrl)}
          />
        )}
      </View>
    </View>
  )
}

export function IntegrationsScreen() {
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const addToast = useNotificationStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, isRefetching, refetch } = useQuery<IntegrationsResponse>({
    queryKey: ['integrations', channelId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: IntegrationsResponse }>(
        `/v1/channels/${channelId}/integrations`,
      )
      return res.data.data
    },
    enabled: !!channelId,
  })

  const disconnectMutation = useMutation<void, Error, string>({
    mutationFn: async (integrationId) => {
      await apiClient.delete(`/v1/channels/${channelId}/integrations/${integrationId}`)
    },
    onSuccess: () => {
      addToast('success', 'Integration disconnected')
      queryClient.invalidateQueries({ queryKey: ['integrations', channelId] })
    },
    onError: () => addToast('error', 'Failed to disconnect integration'),
  })

  async function handleConnect(integrationId: string, oauthUrl?: string) {
    if (!oauthUrl) {
      const res = await apiClient.get<{ data: { oauthUrl: string } }>(
        `/v1/channels/${channelId}/integrations/${integrationId}/connect`,
      )
      oauthUrl = res.data.data.oauthUrl
    }
    if (oauthUrl) {
      await WebBrowser.openBrowserAsync(oauthUrl)
      queryClient.invalidateQueries({ queryKey: ['integrations', channelId] })
    }
  }

  const timedOut = useLoadingTimeout(isLoading)
  const showSkeleton = isLoading && !isError && !timedOut

  const connectedCount = data?.integrations.filter((i) => i.connected).length ?? 0

  return (
    <ErrorBoundary>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#141125' }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHeader
          title="Integrations"
          subtitle={!showSkeleton ? `${connectedCount} connected` : undefined}
        />

        <View className="px-5 pt-4 gap-5">
          {isError ? (
            <ErrorState title="Unable to load integrations" onRetry={refetch} />
          ) : showSkeleton ? (
            <View className="flex-row flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={{ flex: 1, minWidth: 260, maxWidth: 400 }}>
                  <Skeleton className="h-40 rounded-xl" />
                </View>
              ))}
            </View>
          ) : !data?.integrations.length ? (
            <EmptyState
              icon={<Puzzle size={40} color="#3d3566" />}
              title="No integrations available"
              message="Integrations will appear here once configured."
            />
          ) : (
            <>
              {/* Connected */}
              {data.integrations.filter((i) => i.connected).length > 0 && (
                <View className="gap-3">
                  <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5280' }}>
                    Connected
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {data.integrations.filter((i) => i.connected).map((integration) => (
                      <View key={integration.id} style={{ flex: 1, minWidth: 260, maxWidth: 400 }}>
                        <IntegrationCard
                          integration={integration}
                          onConnect={handleConnect}
                          onDisconnect={(id) => disconnectMutation.mutate(id)}
                          isLoading={disconnectMutation.isPending && disconnectMutation.variables === integration.id}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Available */}
              {data.integrations.filter((i) => !i.connected).length > 0 && (
                <View className="gap-3">
                  <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5280' }}>
                    Available
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {data.integrations.filter((i) => !i.connected).map((integration) => (
                      <View key={integration.id} style={{ flex: 1, minWidth: 260, maxWidth: 400 }}>
                        <IntegrationCard
                          integration={integration}
                          onConnect={handleConnect}
                          onDisconnect={(id) => disconnectMutation.mutate(id)}
                          isLoading={false}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ErrorBoundary>
  )
}
