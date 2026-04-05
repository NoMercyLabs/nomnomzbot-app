import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Gift, Trophy, Plus, Trash2, ChevronRight } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'
import { Pressable } from 'react-native'

interface Reward {
  id: string
  twitchId: string
  name: string
  cost: number
  isEnabled: boolean
  backgroundColor?: string
  prompt?: string
  requiresInput: boolean
  maxRedemptions?: number
  cooldownSeconds?: number
  isPaused: boolean
}

function RewardCard({
  reward,
  onToggle,
  onDelete,
}: {
  reward: Reward
  onToggle: (enabled: boolean) => void
  onDelete: () => void
}) {
  return (
    <Pressable
      onPress={() => router.push(`/(dashboard)/rewards/${reward.id}` as any)}
      className="active:opacity-70"
    >
      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: reward.backgroundColor ? `${reward.backgroundColor}30` : '#9146FF30' }}
          >
            <Gift size={18} color={reward.backgroundColor ?? '#9146FF'} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-gray-100">{reward.name}</Text>
            <Text className="text-xs text-accent-400 font-medium">
              {reward.cost.toLocaleString()} pts
            </Text>
          </View>
          <Toggle value={reward.isEnabled && !reward.isPaused} onValueChange={onToggle} />
        </View>

        <View className="flex-row items-center gap-2">
          {reward.isPaused && <Badge variant="warning" label="Paused" />}
          {reward.requiresInput && <Badge variant="muted" label="Input required" />}
          {reward.maxRedemptions && (
            <Badge variant="muted" label={`Max ${reward.maxRedemptions}`} />
          )}
          <View className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onPress={onDelete}
            leftIcon={<Trash2 size={13} color="#ef4444" />}
            label="Delete"
          />
          <ChevronRight size={14} color="#5a5b72" />
        </View>
      </Card>
    </Pressable>
  )
}

export default function RewardsScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: rewards = [], isLoading, refetch, isRefetching } = useQuery<Reward[]>({
    queryKey: ['rewards', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/rewards`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reward> }) =>
      apiClient.patch(`/api/${broadcasterId}/rewards/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rewards', broadcasterId] }),
    onError: () => toast.error('Failed to update reward'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/${broadcasterId}/rewards/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards', broadcasterId] })
      toast.success('Reward deleted')
    },
    onError: () => toast.error('Failed to delete reward'),
  })

  function confirmDelete(reward: Reward) {
    Alert.alert('Delete Reward', `Delete "${reward.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(reward.id),
      },
    ])
  }

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title="Rewards"
        subtitle={`${rewards.filter((r) => r.isEnabled).length} active`}
        rightContent={
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              size="sm"
              onPress={() => router.push('/(dashboard)/rewards/leaderboard' as any)}
              leftIcon={<Trophy size={14} color="#8889a0" />}
              label="Leaderboard"
            />
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-3"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </View>
        ) : rewards.length === 0 ? (
          <EmptyState
            title="No rewards yet"
            message="Channel Points rewards configured in Twitch will appear here."
          />
        ) : (
          rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onToggle={(enabled) => updateMutation.mutate({ id: reward.id, data: { isEnabled: enabled } })}
              onDelete={() => confirmDelete(reward)}
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}
