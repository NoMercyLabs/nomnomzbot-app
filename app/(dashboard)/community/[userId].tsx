import { View, Text, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ban, Clock, MessageSquare, Star, Shield, Crown, User } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'

type TrustLevel = 'viewer' | 'subscriber' | 'vip' | 'moderator' | 'broadcaster'

interface ViewerUser {
  id: string
  userId: string
  username: string
  displayName: string
  trustLevel: TrustLevel
  points: number
  watchtime: number
  messageCount: number
  isBanned: boolean
  firstSeenAt: string
  lastSeenAt: string
}

const TRUST_OPTIONS = [
  { label: 'Viewer', value: 'viewer' },
  { label: 'Subscriber', value: 'subscriber' },
  { label: 'VIP', value: 'vip' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Broadcaster', value: 'broadcaster' },
]

const TRUST_COLORS: Record<TrustLevel, string> = {
  viewer: '#9ca3af',
  subscriber: '#a855f7',
  vip: '#f59e0b',
  moderator: '#3b82f6',
  broadcaster: '#9146FF',
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 rounded-xl bg-surface-overlay border border-border p-3 items-center gap-1">
      {icon}
      <Text className="text-base font-bold text-gray-100">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  )
}

function formatWatchtime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function ViewerDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: user, isLoading } = useQuery<ViewerUser>({
    queryKey: ['community', broadcasterId, userId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/community/${userId}`).then((r) => r.data),
    enabled: !!broadcasterId && !!userId,
  })

  const trustMutation = useMutation({
    mutationFn: (trustLevel: TrustLevel) =>
      apiClient.patch(`/api/${broadcasterId}/community/${userId}`, { trustLevel }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', broadcasterId] })
      toast.success('Trust level updated')
    },
    onError: () => toast.error('Failed to update trust level'),
  })

  const banMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/${broadcasterId}/chat/bans`, {
        userId,
        reason: 'Manual ban via dashboard',
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', broadcasterId] })
      toast.success('User banned')
      router.back()
    },
    onError: () => toast.error('Failed to ban user'),
  })

  const timeoutMutation = useMutation({
    mutationFn: (duration: number) =>
      apiClient.post(`/api/${broadcasterId}/chat/timeouts`, {
        userId,
        duration,
        reason: 'Manual timeout via dashboard',
      }).then((r) => r.data),
    onSuccess: () => toast.success('User timed out'),
    onError: () => toast.error('Failed to timeout user'),
  })

  function confirmBan() {
    Alert.alert('Ban User', `Permanently ban ${user?.displayName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Ban', style: 'destructive', onPress: () => banMutation.mutate() },
    ])
  }

  function confirmTimeout(duration: number, label: string) {
    Alert.alert('Timeout User', `Timeout ${user?.displayName} for ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Timeout', style: 'destructive', onPress: () => timeoutMutation.mutate(duration) },
    ])
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950">
        <PageHeader title="Viewer" showBack />
        <View className="p-4 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </View>
      </View>
    )
  }

  if (!user) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <Text className="text-gray-500">User not found</Text>
      </View>
    )
  }

  const trustColor = TRUST_COLORS[user.trustLevel]

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title={user.displayName} showBack />

      {/* Profile card */}
      <Card className="items-center gap-3 py-6">
        <View
          className="h-16 w-16 rounded-full items-center justify-center"
          style={{ backgroundColor: `${trustColor}20` }}
        >
          <User size={28} color={trustColor} />
        </View>
        <View className="items-center gap-1">
          <Text className="text-lg font-bold text-gray-100">{user.displayName}</Text>
          <Text className="text-sm text-gray-500">@{user.username}</Text>
        </View>
        <View className="flex-row gap-2">
          <Badge
            variant={
              user.trustLevel === 'moderator' ? 'info' :
              user.trustLevel === 'vip' ? 'warning' :
              user.trustLevel === 'subscriber' ? 'success' : 'muted'
            }
            label={user.trustLevel.charAt(0).toUpperCase() + user.trustLevel.slice(1)}
          />
          {user.isBanned && <Badge variant="danger" label="Banned" />}
        </View>
      </Card>

      {/* Stats */}
      <View className="flex-row gap-2">
        <StatCard
          icon={<MessageSquare size={16} color="#3b82f6" />}
          label="Messages"
          value={user.messageCount.toLocaleString()}
        />
        <StatCard
          icon={<Clock size={16} color="#10b981" />}
          label="Watchtime"
          value={formatWatchtime(user.watchtime)}
        />
        <StatCard
          icon={<Star size={16} color="#f59e0b" />}
          label="Points"
          value={user.points.toLocaleString()}
        />
      </View>

      {/* Trust level */}
      <Card className="gap-3">
        <Text className="text-sm font-semibold text-gray-300">Trust Level</Text>
        <Select
          label="Level"
          value={user.trustLevel}
          onValueChange={(v) => trustMutation.mutate(v as TrustLevel)}
          options={TRUST_OPTIONS}
        />
      </Card>

      {/* Actions */}
      {!user.isBanned && (
        <Card className="gap-3">
          <Text className="text-sm font-semibold text-gray-300">Moderation</Text>
          <View className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onPress={() => confirmTimeout(60, '1 minute')}
              loading={timeoutMutation.isPending}
              label="Timeout 1 min"
            />
            <Button
              variant="outline"
              size="sm"
              onPress={() => confirmTimeout(600, '10 minutes')}
              loading={timeoutMutation.isPending}
              label="Timeout 10 min"
            />
            <Button
              variant="outline"
              size="sm"
              onPress={() => confirmTimeout(3600, '1 hour')}
              loading={timeoutMutation.isPending}
              label="Timeout 1 hour"
            />
            <Button
              variant="danger"
              size="sm"
              onPress={confirmBan}
              loading={banMutation.isPending}
              leftIcon={<Ban size={14} color="white" />}
              label="Ban User"
            />
          </View>
        </Card>
      )}
    </ScrollView>
  )
}
