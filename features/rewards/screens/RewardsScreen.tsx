import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useApiQuery } from '@/hooks/useApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { Gift, Plus, Edit2, Trash2, Coins, ChevronRight } from 'lucide-react-native'
import { ErrorState } from '@/components/ui/ErrorState'
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout'

interface Reward {
  id: string
  title: string
  cost: number
  enabled: boolean
  isPaused: boolean
  redemptionCount: number
  cooldown: number | null
  handlerType?: string
}

type Tab = 'All Rewards' | 'Redemption Queue' | 'Settings'
const TABS: Tab[] = ['All Rewards', 'Redemption Queue', 'Settings']

const HANDLER_COLORS: Record<string, string> = {
  bot: '#a78bfa',
  manual: '#60a5fa',
  custom: '#4ade80',
}

function RewardCard({ reward, onEdit, onDelete, onToggle }: {
  reward: Reward
  onEdit: () => void
  onDelete: () => void
  onToggle: (enabled: boolean) => void
}) {
  const handlerColor = HANDLER_COLORS[reward.handlerType ?? 'manual'] ?? '#8889a0'

  return (
    <View
      className="rounded-xl p-4 gap-3"
      style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
    >
      {/* Header */}
      <View className="flex-row items-start gap-3">
        <View
          className="h-10 w-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: 'rgba(124,58,237,0.15)' }}
        >
          <Gift size={18} color="#a78bfa" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>{reward.title}</Text>
          <View className="flex-row items-center gap-1.5">
            <Coins size={11} color="#fbbf24" />
            <Text className="text-xs font-bold" style={{ color: '#fbbf24' }}>
              {reward.cost.toLocaleString()} pts
            </Text>
          </View>
        </View>
        <Toggle value={reward.enabled && !reward.isPaused} onValueChange={onToggle} />
      </View>

      {/* Handler + redemptions */}
      <View className="flex-row items-center gap-2">
        <View
          className="px-2 py-0.5 rounded"
          style={{ backgroundColor: `${handlerColor}20` }}
        >
          <Text className="text-xs font-medium capitalize" style={{ color: handlerColor }}>
            {reward.handlerType ?? 'manual'}
          </Text>
        </View>
        <Text className="text-xs" style={{ color: '#5a5280' }}>
          {reward.redemptionCount.toLocaleString()} redemptions
        </Text>
        {reward.isPaused && (
          <View className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.2)' }}>
            <Text className="text-xs font-medium" style={{ color: '#fbbf24' }}>Paused</Text>
          </View>
        )}
        {!reward.enabled && (
          <View className="px-2 py-0.5 rounded" style={{ backgroundColor: '#231D42' }}>
            <Text className="text-xs font-medium" style={{ color: '#5a5280' }}>Disabled</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-2" style={{ borderTopWidth: 1, borderTopColor: '#1e1a35', paddingTop: 10 }}>
        <View className="flex-1" />
        <Pressable
          onPress={onEdit}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: '#231D42' }}
        >
          <Edit2 size={12} color="#8889a0" />
          <Text className="text-xs font-medium" style={{ color: '#8889a0' }}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
        >
          <Trash2 size={12} color="#ef4444" />
          <Text className="text-xs font-medium" style={{ color: '#ef4444' }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  )
}

function QueueEmpty() {
  return (
    <View className="items-center py-16">
      <Gift size={40} color="#2e2757" />
      <Text className="text-sm mt-4" style={{ color: '#3d3566' }}>No pending redemptions</Text>
      <Text className="text-xs mt-1" style={{ color: '#2e2757' }}>Redemptions appear here when viewers redeem rewards</Text>
    </View>
  )
}

export function RewardsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('All Rewards')
  const [confirmDelete, setConfirmDelete] = useState<Reward | null>(null)
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const queryClient = useQueryClient()
  const addToast = useNotificationStore((s) => s.addToast)
  const { data: rewards, isLoading, isError, isRefetching, refetch } = useApiQuery<Reward[]>('rewards', '/rewards')

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/v1/channels/${channelId}/rewards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'rewards'] })
      addToast('success', 'Reward deleted')
      setConfirmDelete(null)
    },
    onError: () => addToast('error', 'Failed to delete reward'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiClient.patch(`/api/v1/channels/${channelId}/rewards/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'rewards'] })
    },
    onError: () => addToast('error', 'Failed to update reward'),
  })

  const timedOut = useLoadingTimeout(isLoading)
  const showSkeleton = isLoading && !isError && !timedOut

  const enabledCount = rewards?.filter((r) => r.enabled && !r.isPaused).length ?? 0
  const totalCount = rewards?.length ?? 0

  return (
    <ErrorBoundary>
      <View className="flex-1" style={{ backgroundColor: '#141125' }}>
        <PageHeader
          title="Channel Rewards"
          subtitle={!showSkeleton ? `${enabledCount} / ${totalCount} active` : undefined}
          rightContent={
            <View className="flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                label="Sync from Twitch"
                onPress={() => refetch()}
              />
              <Button
                size="sm"
                label="Add Reward"
                leftIcon={<Plus size={13} color="white" />}
                onPress={() => router.push('/(dashboard)/rewards/new' as any)}
              />
            </View>
          }
        />

        {/* Tab bar */}
        <View
          className="flex-row px-5"
          style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
        >
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="py-3 mr-5"
              style={{
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab ? '#7C3AED' : 'transparent',
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: activeTab === tab ? '#a78bfa' : '#5a5280' }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'All Rewards' && (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          >
            {isError ? (
              <ErrorState title="Unable to load rewards" onRetry={refetch} />
            ) : showSkeleton ? (
              <View className="flex-row flex-wrap gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={{ flex: 1, minWidth: 260, maxWidth: 400 }}>
                    <Skeleton className="h-40 rounded-xl" />
                  </View>
                ))}
              </View>
            ) : !rewards?.length ? (
              <EmptyState
                icon={<Gift size={40} color="#3d3566" />}
                title="No rewards yet"
                message="Create channel point rewards for your viewers."
                actionLabel="Create Reward"
                onAction={() => router.push('/(dashboard)/rewards/new' as any)}
              />
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {rewards.map((reward) => (
                  <View key={reward.id} style={{ flex: 1, minWidth: 260, maxWidth: 400 }}>
                    <RewardCard
                      reward={reward}
                      onEdit={() => router.push(`/(dashboard)/rewards/${reward.id}` as any)}
                      onDelete={() => setConfirmDelete(reward)}
                      onToggle={(enabled) => toggleMutation.mutate({ id: reward.id, enabled })}
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === 'Redemption Queue' && (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <QueueEmpty />
          </ScrollView>
        )}

        {activeTab === 'Settings' && (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }}>
            <View
              className="rounded-xl px-4"
              style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
            >
              {[
                { label: 'Pause All Rewards', description: 'Temporarily pause all active rewards' },
                { label: 'Auto-fulfill Redemptions', description: 'Automatically mark redemptions as fulfilled' },
              ].map((item, i) => (
                <View
                  key={item.label}
                  className="flex-row items-center justify-between py-4"
                  style={i > 0 ? { borderTopWidth: 1, borderTopColor: '#1e1a35' } : undefined}
                >
                  <View className="flex-1 mr-4 gap-0.5">
                    <Text className="text-sm font-medium text-white">{item.label}</Text>
                    <Text className="text-xs" style={{ color: '#5a5280' }}>{item.description}</Text>
                  </View>
                  <Toggle value={false} onValueChange={() => {}} />
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <ConfirmDialog
        visible={!!confirmDelete}
        title="Delete Reward"
        message={`Delete "${confirmDelete?.title ?? ''}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </ErrorBoundary>
  )
}
