import { useState } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, RefreshControl, Alert } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Shield, Star, Crown, User, Ban, ChevronRight } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
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
  avatarUrl?: string
}

const TRUST_CONFIG: Record<TrustLevel, { label: string; color: string; icon: typeof User }> = {
  viewer: { label: 'Viewer', color: '#9ca3af', icon: User },
  subscriber: { label: 'Subscriber', color: '#a855f7', icon: Star },
  vip: { label: 'VIP', color: '#f59e0b', icon: Star },
  moderator: { label: 'Moderator', color: '#3b82f6', icon: Shield },
  broadcaster: { label: 'Broadcaster', color: '#9146FF', icon: Crown },
}

const TRUST_LEVELS: TrustLevel[] = ['viewer', 'subscriber', 'vip', 'moderator', 'broadcaster']

function UserRow({ user, onPress }: { user: ViewerUser; onPress: () => void }) {
  const trust = TRUST_CONFIG[user.trustLevel]
  const TrustIcon = trust.icon

  return (
    <Pressable onPress={onPress} className="active:opacity-70">
      <Card className="flex-row items-center gap-3 py-3">
        <View
          className="h-10 w-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${trust.color}20` }}
        >
          <TrustIcon size={18} color={trust.color} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-gray-100">{user.displayName}</Text>
          <Text className="text-xs text-gray-500">@{user.username}</Text>
        </View>
        <View className="items-end gap-1">
          <Badge
            variant={
              user.trustLevel === 'moderator' ? 'info' :
              user.trustLevel === 'vip' ? 'warning' :
              user.trustLevel === 'subscriber' ? 'success' :
              'muted'
            }
            label={trust.label}
          />
          {user.isBanned && <Badge variant="danger" label="Banned" />}
        </View>
        <ChevronRight size={14} color="#5a5b72" />
      </Card>
    </Pressable>
  )
}

export default function CommunityScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<TrustLevel | 'all'>('all')
  const toast = useToast()
  const qc = useQueryClient()

  const { data: users = [], isLoading, refetch, isRefetching } = useQuery<ViewerUser[]>({
    queryKey: ['community', broadcasterId, filterLevel],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/community`, {
        params: { trustLevel: filterLevel === 'all' ? undefined : filterLevel },
      }).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.displayName.toLowerCase().includes(search.toLowerCase()),
      )
    : users

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title="Community"
        subtitle={`${users.length} viewers`}
      />

      {/* Search */}
      <View className="px-4 pb-2">
        <View className="flex-row items-center gap-2 rounded-xl bg-surface-overlay border border-border px-3 py-2">
          <Search size={16} color="#5a5b72" />
          <TextInput
            placeholder="Search viewers..."
            placeholderTextColor="#5a5b72"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-sm text-gray-200"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 pb-3 gap-2"
      >
        {(['all', ...TRUST_LEVELS] as const).map((level) => (
          <Pressable
            key={level}
            onPress={() => setFilterLevel(level)}
            className={`rounded-full px-3 py-1.5 border ${
              filterLevel === level
                ? 'bg-accent-600 border-accent-600'
                : 'border-border bg-surface-overlay'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                filterLevel === level ? 'text-white' : 'text-gray-400'
              }`}
            >
              {level === 'all' ? 'All' : TRUST_CONFIG[level].label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-2"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#9146FF"
          />
        }
      >
        {isLoading ? (
          <View className="gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No viewers found"
            message={search ? 'Try a different search term.' : 'No viewers match the current filter.'}
          />
        ) : (
          filtered.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onPress={() => router.push(`/(dashboard)/community/${user.userId}` as any)}
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}
