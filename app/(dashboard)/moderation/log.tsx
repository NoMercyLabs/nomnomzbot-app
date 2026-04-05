import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Shield, Ban, Clock, Trash2, Eye, EyeOff } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChannelStore } from '@/stores/useChannelStore'
import { apiClient } from '@/lib/api/client'

interface ModLogEntry {
  id: string
  action: 'ban' | 'unban' | 'timeout' | 'untimeout' | 'delete_message' | 'clear_chat'
  moderatorUsername: string
  targetUsername?: string
  reason?: string
  durationSeconds?: number
  timestamp: string
}

const ACTION_CONFIG: Record<ModLogEntry['action'], {
  label: string
  color: string
  icon: typeof Shield
}> = {
  ban: { label: 'Ban', color: '#ef4444', icon: Ban },
  unban: { label: 'Unban', color: '#10b981', icon: Shield },
  timeout: { label: 'Timeout', color: '#f59e0b', icon: Clock },
  untimeout: { label: 'Untimeout', color: '#10b981', icon: Clock },
  delete_message: { label: 'Delete', color: '#6b7280', icon: Trash2 },
  clear_chat: { label: 'Clear Chat', color: '#ef4444', icon: Trash2 },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function ModLogScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data: entries = [], isLoading, refetch, isRefetching } = useQuery<ModLogEntry[]>({
    queryKey: ['moderation', 'log', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/moderation/log`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="Mod Log" showBack subtitle={`${entries.length} entries`} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-2 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </View>
        ) : entries.length === 0 ? (
          <EmptyState title="No mod actions" message="Moderation actions will appear here." />
        ) : (
          entries.map((entry) => {
            const cfg = ACTION_CONFIG[entry.action]
            const Icon = cfg.icon
            return (
              <Card key={entry.id} className="flex-row items-center gap-3 py-3">
                <View
                  className="h-8 w-8 rounded-lg items-center justify-center"
                  style={{ backgroundColor: `${cfg.color}20` }}
                >
                  <Icon size={14} color={cfg.color} />
                </View>
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-semibold text-gray-200">
                      {entry.moderatorUsername}
                    </Text>
                    <Badge
                      variant={
                        entry.action === 'ban' ? 'danger' :
                        entry.action === 'timeout' ? 'warning' :
                        entry.action.includes('un') ? 'success' : 'muted'
                      }
                      label={cfg.label}
                    />
                    {entry.targetUsername && (
                      <Text className="text-xs text-gray-500">→ {entry.targetUsername}</Text>
                    )}
                  </View>
                  {entry.reason && (
                    <Text className="text-xs text-gray-500" numberOfLines={1}>{entry.reason}</Text>
                  )}
                  {entry.durationSeconds && (
                    <Text className="text-xs text-gray-600">{entry.durationSeconds}s</Text>
                  )}
                </View>
                <Text className="text-xs text-gray-600">{formatDate(entry.timestamp)}</Text>
              </Card>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}
