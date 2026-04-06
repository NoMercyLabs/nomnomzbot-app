import { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ScrollView,
} from 'react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Ban, Search, Star, Shield, Crown } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useChannelStore } from '@/stores/useChannelStore'
import { apiClient } from '@/lib/api/client'
import { getInitials } from '@/lib/utils/string'
import { formatRelativeTime } from '@/lib/utils/format'
import { communityApi } from '../api'
import { TrustBadge } from '../components/TrustBadge'
import type { CommunityUser, BannedUser } from '../types'
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout'

interface CommunityStats {
  followers: number
  subscribers: number
  vips: number
  moderators: number
}

type Tab = 'Followers' | 'Subscribers' | 'VIPs' | 'Moderators' | 'Bans'

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <View
      className="flex-1 rounded-xl px-4 py-3 gap-1.5"
      style={{
        backgroundColor: '#1A1530',
        borderWidth: 1,
        borderColor: '#1e1a35',
        borderLeftWidth: 3,
        borderLeftColor: color,
        minWidth: 100,
      }}
    >
      {icon}
      <Text className="text-xl font-bold text-white">{value.toLocaleString()}</Text>
      <Text className="text-xs" style={{ color: '#5a5280' }}>{label}</Text>
    </View>
  )
}

interface UserRowProps {
  user: CommunityUser
  onPress: () => void
}

function UserRow({ user, onPress }: UserRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-5 py-2.5"
      style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
    >
      {/* USER col (flex: 3) */}
      <View style={{ flex: 3 }} className="flex-row items-center gap-2.5">
        <View
          className="h-7 w-7 rounded-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#231D42' }}
        >
          {user.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} contentFit="cover" style={{ width: 28, height: 28, borderRadius: 14 }} />
          ) : (
            <Text className="text-xs font-bold" style={{ color: '#a78bfa' }}>
              {getInitials(user.displayName || user.username)}
            </Text>
          )}
        </View>
        <Text className="text-sm font-medium text-white" numberOfLines={1}>
          {user.displayName || user.username}
        </Text>
      </View>
      {/* ROLE col (flex: 1) */}
      <View style={{ flex: 1 }}>
        <TrustBadge level={user.trustLevel} />
      </View>
      {/* MSGS col (flex: 1) */}
      <View style={{ flex: 1 }}>
        <Text className="text-xs" style={{ color: '#8889a0' }}>{user.messageCount.toLocaleString()}</Text>
      </View>
      {/* WATCH col (flex: 1) */}
      <View style={{ flex: 1 }}>
        <Text className="text-xs" style={{ color: '#8889a0' }}>{user.watchHours}h</Text>
      </View>
      {/* LAST SEEN col (flex: 1.5) */}
      <View style={{ flex: 1.5 }}>
        <Text className="text-xs" style={{ color: '#5a5280' }}>{formatRelativeTime(user.lastSeen)}</Text>
      </View>
    </Pressable>
  )
}

function UserRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 px-5 py-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </View>
    </View>
  )
}

function BanRow({ ban, onUnban, unbanning }: { ban: BannedUser; onUnban: () => void; unbanning: boolean }) {
  return (
    <View
      className="px-5 py-3 gap-1"
      style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-white">{ban.displayName || ban.username}</Text>
        <Button label="Unban" variant="outline" size="sm" loading={unbanning} onPress={onUnban} />
      </View>
      <Text className="text-xs" style={{ color: '#8889a0' }}>Reason: {ban.reason || 'No reason provided'}</Text>
      <Text className="text-xs" style={{ color: '#5a5280' }}>
        Banned by {ban.bannedBy} · {formatRelativeTime(ban.bannedAt)}
      </Text>
    </View>
  )
}

const TAB_ROLE_MAP: Record<Tab, 'follower' | 'subscriber' | 'vip' | 'moderator' | undefined> = {
  Followers: 'follower',
  Subscribers: 'subscriber',
  VIPs: 'vip',
  Moderators: 'moderator',
  Bans: undefined,
}

function UsersTab({ channelId, role }: { channelId: string; role?: 'follower' | 'subscriber' | 'vip' | 'moderator' }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['channel', channelId, 'community', 'users', debouncedSearch, role],
    queryFn: () => communityApi.getUsers(channelId, { search: debouncedSearch || undefined, page: 1, take: 25, role }),
    enabled: !!channelId,
  })

  const timedOut = useLoadingTimeout(isLoading)
  const showSkeleton = isLoading && !isError && !timedOut

  const users = data?.data ?? []

  return (
    <View className="flex-1">
      <View
        className="px-5 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
      >
        <View
          className="flex-row items-center gap-2.5 rounded-lg px-3 py-2.5"
          style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
        >
          <Search size={14} color="#5a5280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search users..."
            placeholderTextColor="#3d3566"
            className="flex-1 text-sm text-white"
            style={{ outlineStyle: 'none' } as any}
          />
        </View>
      </View>

      {/* Table header */}
      <View
        className="flex-row items-center px-5 py-2.5"
        style={{ backgroundColor: '#1A1530', borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
      >
        {[
          { label: 'USER', flex: 3 },
          { label: 'ROLE', flex: 1 },
          { label: 'MSGS', flex: 1 },
          { label: 'WATCH', flex: 1 },
          { label: 'LAST SEEN', flex: 1.5 },
        ].map((col) => (
          <View key={col.label} style={{ flex: col.flex }}>
            <Text className="text-xs font-semibold tracking-wider" style={{ color: '#3d3566' }}>
              {col.label}
            </Text>
          </View>
        ))}
      </View>

      <FlatList
        data={showSkeleton ? ([] as CommunityUser[]) : users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserRow user={item} onPress={() => router.push(`/(dashboard)/community/${item.id}` as any)} />
        )}
        ListHeaderComponent={
          showSkeleton ? (
            <View>
              {Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !showSkeleton ? (
            <EmptyState
              icon={<Users size={40} color="#3d3566" />}
              title="No users found"
              message={debouncedSearch ? `No users match "${debouncedSearch}"` : 'No users in this channel yet.'}
            />
          ) : null
        }
        ListFooterComponent={
          data && users.length > 0 ? (
            <View className="px-5 py-3 flex-row items-center justify-between" style={{ borderTopWidth: 1, borderTopColor: '#1e1a35' }}>
              <Text className="text-xs" style={{ color: '#5a5280' }}>
                Showing {users.length} users
              </Text>
              {data.hasMore && (
                <Pressable className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#231D42' }}>
                  <Text className="text-xs font-medium" style={{ color: '#8889a0' }}>Load more</Text>
                </Pressable>
              )}
            </View>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />}
      />
    </View>
  )
}

function BansTab({ channelId }: { channelId: string }) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['channel', channelId, 'community', 'bans'],
    queryFn: () => communityApi.getBans(channelId, { page: 1, take: 25 }),
    enabled: !!channelId,
  })

  const timedOut = useLoadingTimeout(isLoading)
  const showSkeleton = isLoading && !isError && !timedOut

  const { mutate: unban, variables: unbanningId, isPending: isUnbanning } = useMutation({
    mutationFn: (userId: string) => communityApi.unbanUser(channelId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'community', 'bans'] }),
  })

  const bans = data?.data ?? []

  return (
    <FlatList
      data={showSkeleton ? ([] as BannedUser[]) : bans}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BanRow ban={item} onUnban={() => unban(item.id)} unbanning={isUnbanning && unbanningId === item.id} />
      )}
      ListHeaderComponent={
        showSkeleton ? (
          <View className="px-5 py-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} className="gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </View>
            ))}
          </View>
        ) : null
      }
      ListEmptyComponent={
        !showSkeleton && !isRefetching && data !== undefined ? (
          <EmptyState icon={<Ban size={40} color="#3d3566" />} title="No bans" message="No banned users in this channel." />
        ) : null
      }
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />}
    />
  )
}

export function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Followers')
  const channelId = useChannelStore((s) => s.currentChannel?.id) ?? ''

  const { data: stats } = useQuery<CommunityStats>({
    queryKey: ['channel', channelId, 'community', 'stats'],
    queryFn: () =>
      apiClient
        .get<{ data: CommunityStats }>(`/v1/channels/${channelId}/community/stats`)
        .then((r) => r.data.data),
    enabled: !!channelId,
  })

  const TABS: Tab[] = ['Followers', 'Subscribers', 'VIPs', 'Moderators', 'Bans']

  return (
    <ErrorBoundary>
      <View className="flex-1" style={{ backgroundColor: '#141125' }}>
        <PageHeader title="Community" subtitle="Followers, subscribers, VIPs, and moderators" />

        {/* Stat cards */}
        <View className="flex-row flex-wrap gap-3 px-5 py-3">
          <StatCard label="Followers" value={stats?.followers ?? 0} color="#3b82f6" icon={<Users size={14} color="#60a5fa" />} />
          <StatCard label="Subscribers" value={stats?.subscribers ?? 0} color="#a78bfa" icon={<Star size={14} color="#a78bfa" />} />
          <StatCard label="VIPs" value={stats?.vips ?? 0} color="#f59e0b" icon={<Crown size={14} color="#fbbf24" />} />
          <StatCard label="Moderators" value={stats?.moderators ?? 0} color="#22c55e" icon={<Shield size={14} color="#4ade80" />} />
        </View>

        {/* Tab + search bar */}
        <View
          className="px-5 py-2 gap-3"
          style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {TABS.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: activeTab === tab ? 'rgba(124,58,237,0.25)' : '#1A1530',
                    borderWidth: 1,
                    borderColor: activeTab === tab ? '#7C3AED' : '#1e1a35',
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{ color: activeTab === tab ? '#a78bfa' : '#5a5280' }}
                  >
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {activeTab === 'Bans' ? (
          <BansTab channelId={channelId} />
        ) : (
          <UsersTab channelId={channelId} role={TAB_ROLE_MAP[activeTab]} />
        )}
      </View>
    </ErrorBoundary>
  )
}
