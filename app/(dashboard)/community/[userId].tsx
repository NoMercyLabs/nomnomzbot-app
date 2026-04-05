import { useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { useChannelStore } from '@/stores/useChannelStore'
import { communityApi } from '@/features/community/api'
import { TrustBadge } from '@/features/community/components/TrustBadge'
import type { TrustLevel } from '@/features/community/types'

const TRUST_OPTIONS: { label: string; value: TrustLevel }[] = [
  { label: 'Viewer', value: 'viewer' },
  { label: 'Regular', value: 'regular' },
  { label: 'VIP', value: 'vip' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Broadcaster', value: 'broadcaster' },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface CardProps {
  title: string
  children: React.ReactNode
}

function Card({ title, children }: CardProps) {
  return (
    <View className="mx-4 mb-4 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <View className="px-4 py-3 border-b border-gray-800">
        <Text className="text-sm font-semibold text-gray-300">{title}</Text>
      </View>
      <View className="p-4">{children}</View>
    </View>
  )
}

interface StatRowProps {
  label: string
  value: string | number
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <View className="flex-row justify-between py-1.5">
      <Text className="text-sm text-gray-400">{label}</Text>
      <Text className="text-sm text-gray-100">{value}</Text>
    </View>
  )
}

export default function ViewerDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const channelId = useChannelStore((s) => s.currentChannel?.id) ?? ''
  const queryClient = useQueryClient()

  const [banDialogVisible, setBanDialogVisible] = useState(false)
  const [unbanDialogVisible, setUnbanDialogVisible] = useState(false)
  const [banReason, setBanReason] = useState('')

  const { data: user, isLoading } = useQuery({
    queryKey: ['channel', channelId, 'community', 'user', userId],
    queryFn: () => communityApi.getUser(channelId, userId),
    enabled: !!channelId && !!userId,
  })

  const { mutate: setTrust, isPending: isSettingTrust } = useMutation({
    mutationFn: (level: TrustLevel) =>
      communityApi.setTrustLevel(channelId, userId, level),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['channel', channelId, 'community', 'user', userId],
      })
    },
  })

  const { mutate: ban, isPending: isBanning } = useMutation({
    mutationFn: () => communityApi.banUser(channelId, userId, banReason),
    onSuccess: () => {
      setBanDialogVisible(false)
      setBanReason('')
      queryClient.invalidateQueries({
        queryKey: ['channel', channelId, 'community', 'user', userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['channel', channelId, 'community', 'bans'],
      })
    },
  })

  const { mutate: unban, isPending: isUnbanning } = useMutation({
    mutationFn: () => communityApi.unbanUser(channelId, userId),
    onSuccess: () => {
      setUnbanDialogVisible(false)
      queryClient.invalidateQueries({
        queryKey: ['channel', channelId, 'community', 'user', userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['channel', channelId, 'community', 'bans'],
      })
    },
  })

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950">
        <PageHeader title="Viewer" backHref="/(dashboard)/community" />
        <ScrollView className="flex-1" contentContainerClassName="py-4">
          <View className="items-center py-6 gap-3">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </View>
          <View className="mx-4 gap-2">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </View>
        </ScrollView>
      </View>
    )
  }

  if (!user) {
    return (
      <View className="flex-1 bg-gray-950">
        <PageHeader title="Viewer" backHref="/(dashboard)/community" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">User not found.</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title={user.displayName || user.username}
        backHref="/(dashboard)/community"
      />

      <ScrollView className="flex-1" contentContainerClassName="py-4 pb-8">
        {/* Avatar + name */}
        <View className="items-center py-6 gap-3">
          <View className="h-16 w-16 rounded-full bg-gray-700 items-center justify-center">
            <Text className="text-xl font-bold text-gray-300">
              {getInitials(user.displayName || user.username)}
            </Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-lg font-bold text-gray-100">{user.displayName}</Text>
            <Text className="text-sm text-gray-400">@{user.username}</Text>
            <Text className="text-xs text-gray-500">Joined {formatDate(user.firstSeen)}</Text>
          </View>
          {user.isBanned && (
            <View className="bg-red-900/50 rounded-lg px-3 py-1.5">
              <Text className="text-xs font-semibold text-red-400">BANNED</Text>
            </View>
          )}
        </View>

        {/* Trust level */}
        <Card title="Trust Level">
          <View className="flex-row items-center gap-3 mb-3">
            <Text className="text-sm text-gray-400">Current level:</Text>
            <TrustBadge level={user.trustLevel} />
          </View>
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <Select
                label="Override trust level"
                value={user.trustLevel}
                onValueChange={(v) => setTrust(v as TrustLevel)}
                options={TRUST_OPTIONS}
              />
            </View>
            {isSettingTrust && (
              <ActivityIndicator size="small" color="#a855f7" />
            )}
          </View>
        </Card>

        {/* Stats */}
        <Card title="Stats">
          <StatRow label="Messages sent" value={user.messageCount.toLocaleString()} />
          <View className="h-px bg-gray-800 my-1" />
          <StatRow label="Watch hours" value={`${user.watchHours.toLocaleString()}h`} />
          <View className="h-px bg-gray-800 my-1" />
          <StatRow label="Commands used" value={user.commandsUsed.toLocaleString()} />
          <View className="h-px bg-gray-800 my-1" />
          <StatRow label="First seen" value={formatDate(user.firstSeen)} />
          <View className="h-px bg-gray-800 my-1" />
          <StatRow label="Last seen" value={formatDate(user.lastSeen)} />
        </Card>

        {/* Recent activity */}
        {user.recentActivity.length > 0 && (
          <Card title="Recent Activity">
            {user.recentActivity.slice(0, 5).map((activity, i) => (
              <View
                key={i}
                className={`py-2 ${i < Math.min(user.recentActivity.length, 5) - 1 ? 'border-b border-gray-800' : ''}`}
              >
                <View className="flex-row items-center gap-2 mb-0.5">
                  <View
                    className={`rounded px-1.5 py-0.5 ${
                      activity.type === 'command' ? 'bg-blue-900' : 'bg-gray-800'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        activity.type === 'command' ? 'text-blue-300' : 'text-gray-400'
                      }`}
                    >
                      {activity.type}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</Text>
                </View>
                <Text className="text-sm text-gray-200">{activity.content}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Ban history */}
        {user.banHistory.length > 0 && (
          <Card title="Ban History">
            {user.banHistory.map((record, i) => (
              <View
                key={record.id}
                className={`py-2 ${i < user.banHistory.length - 1 ? 'border-b border-gray-800' : ''}`}
              >
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text className="text-xs text-gray-400">Banned by {record.bannedBy}</Text>
                  {record.unbannedAt && (
                    <View className="bg-green-900/50 rounded px-1.5 py-0.5">
                      <Text className="text-xs text-green-400">Unbanned</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-gray-200">{record.reason || 'No reason given'}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {formatDate(record.bannedAt)}
                  {record.unbannedAt ? ` → ${formatDate(record.unbannedAt)}` : ''}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View className="mx-4 gap-3">
          {user.isBanned ? (
            <Button
              label="Unban User"
              variant="secondary"
              loading={isUnbanning}
              onPress={() => setUnbanDialogVisible(true)}
            />
          ) : (
            <Button
              label="Ban User"
              variant="danger"
              loading={isBanning}
              onPress={() => setBanDialogVisible(true)}
            />
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={banDialogVisible}
        title="Ban User"
        message={`Are you sure you want to ban ${user.displayName || user.username}? This will prevent them from chatting.`}
        confirmLabel="Ban"
        variant="danger"
        onConfirm={() => ban()}
        onCancel={() => setBanDialogVisible(false)}
      />

      <ConfirmDialog
        visible={unbanDialogVisible}
        title="Unban User"
        message={`Are you sure you want to unban ${user.displayName || user.username}?`}
        confirmLabel="Unban"
        variant="default"
        onConfirm={() => unban()}
        onCancel={() => setUnbanDialogVisible(false)}
      />
    </View>
  )
}
