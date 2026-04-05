import { View, Text, ScrollView, Alert, RefreshControl } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ban, Clock, UserCheck } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'

interface BanEntry {
  id: string
  userId: string
  username: string
  displayName: string
  reason?: string
  moderatorName: string
  createdAt: string
  expiresAt?: string
  isPermanent: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function BanCard({ ban, onUnban }: { ban: BanEntry; onUnban: () => void }) {
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 rounded-full bg-red-900/30 items-center justify-center">
          <Ban size={18} color="#ef4444" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-gray-100">{ban.displayName}</Text>
          <Text className="text-xs text-gray-500">@{ban.username}</Text>
        </View>
        <Badge
          variant={ban.isPermanent ? 'danger' : 'warning'}
          label={ban.isPermanent ? 'Permanent' : 'Timeout'}
        />
      </View>

      {ban.reason && (
        <Text className="text-xs text-gray-400 bg-surface-overlay rounded-lg px-3 py-2">
          {ban.reason}
        </Text>
      )}

      <View className="flex-row items-center gap-2">
        <Clock size={12} color="#5a5b72" />
        <Text className="text-xs text-gray-500 flex-1">
          Banned {formatDate(ban.createdAt)} by {ban.moderatorName}
          {ban.expiresAt ? ` · Expires ${formatDate(ban.expiresAt)}` : ''}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onPress={onUnban}
          leftIcon={<UserCheck size={13} color="#10b981" />}
          label="Unban"
        />
      </View>
    </Card>
  )
}

export default function BansScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: bans = [], isLoading, refetch, isRefetching } = useQuery<BanEntry[]>({
    queryKey: ['moderation', 'bans', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/moderation/bans`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const unbanMutation = useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/api/${broadcasterId}/chat/bans/${userId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moderation', 'bans', broadcasterId] })
      toast.success('User unbanned')
    },
    onError: () => toast.error('Failed to unban user'),
  })

  function confirmUnban(ban: BanEntry) {
    Alert.alert('Unban User', `Unban ${ban.displayName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unban',
        onPress: () => unbanMutation.mutate(ban.userId),
      },
    ])
  }

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title="Ban List"
        showBack
        subtitle={`${bans.length} active ${bans.length === 1 ? 'ban' : 'bans'}`}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-3"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#9146FF"
          />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </View>
        ) : bans.length === 0 ? (
          <EmptyState
            title="No active bans"
            message="All users are currently in good standing."
          />
        ) : (
          bans.map((ban) => (
            <BanCard key={ban.id} ban={ban} onUnban={() => confirmUnban(ban)} />
          ))
        )}
      </ScrollView>
    </View>
  )
}
