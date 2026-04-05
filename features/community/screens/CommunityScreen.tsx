import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Ban } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useChannelStore } from '@/stores/useChannelStore'
import { communityApi } from '../api'
import { TrustBadge } from '../components/TrustBadge'
import type { CommunityUser, BannedUser } from '../types'

type Tab = 'users' | 'bans'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface UserRowProps {
  user: CommunityUser
  onPress: () => void
}

function UserRow({ user, onPress }: UserRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-gray-800"
    >
      {/* Avatar */}
      <View className="h-10 w-10 rounded-full bg-gray-700 items-center justify-center overflow-hidden">
        <Text className="text-sm font-bold text-gray-300">
          {getInitials(user.displayName || user.username)}
        </Text>
      </View>

      {/* Info */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-gray-100">{user.displayName || user.username}</Text>
          <TrustBadge level={user.trustLevel} />
        </View>
        <View className="flex-row gap-3">
          <Text className="text-xs text-gray-500">{user.messageCount} msgs</Text>
          <Text className="text-xs text-gray-500">{user.watchHours}h watched</Text>
          <Text className="text-xs text-gray-500">seen {formatRelativeTime(user.lastSeen)}</Text>
        </View>
      </View>
    </Pressable>
  )
}

function UserRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </View>
    </View>
  )
}

interface BanRowProps {
  ban: BannedUser
  onUnban: () => void
  unbanning: boolean
}

function BanRow({ ban, onUnban, unbanning }: BanRowProps) {
  return (
    <View className="px-4 py-3 gap-1 border-b border-gray-800">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-gray-100">{ban.displayName || ban.username}</Text>
        <Button
          label="Unban"
          variant="outline"
          size="sm"
          loading={unbanning}
          onPress={onUnban}
        />
      </View>
      <Text className="text-xs text-gray-400">Reason: {ban.reason || 'No reason provided'}</Text>
      <Text className="text-xs text-gray-500">
        Banned by {ban.bannedBy} · {formatRelativeTime(ban.bannedAt)}
      </Text>
    </View>
  )
}

function UsersTab({ channelId }: { channelId: string }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['channel', channelId, 'community', 'users', debouncedSearch],
    queryFn: () =>
      communityApi.getUsers(channelId, {
        search: debouncedSearch || undefined,
        page: 1,
        take: 25,
      }),
    enabled: !!channelId,
  })

  const users = data?.data ?? []

  return (
    <View className="flex-1">
      {/* Search */}
      <View className="px-4 py-3 border-b border-gray-800">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search users..."
          placeholderTextColor="#6b7280"
          className="bg-gray-800 rounded-lg px-3 py-2.5 text-sm text-white"
        />
      </View>

      <FlatList
        data={isLoading ? ([] as CommunityUser[]) : users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserRow
            user={item}
            onPress={() => router.push(`/(dashboard)/community/${item.id}` as any)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-800 ml-16" />}
        ListHeaderComponent={
          isLoading ? (
            <View>
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i}>
                  <UserRowSkeleton />
                  {i < 4 && <View className="h-px bg-gray-800 ml-16" />}
                </View>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<Users size={40} color="#6b7280" />}
              title="No users found"
              message={debouncedSearch ? `No users match "${debouncedSearch}"` : 'No users in this channel yet.'}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#a855f7"
          />
        }
      />
    </View>
  )
}

function BansTab({ channelId }: { channelId: string }) {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['channel', channelId, 'community', 'bans'],
    queryFn: () => communityApi.getBans(channelId, { page: 1, take: 25 }),
    enabled: !!channelId,
  })

  const { mutate: unban, variables: unbanningId, isPending: isUnbanning } = useMutation({
    mutationFn: (userId: string) => communityApi.unbanUser(channelId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'community', 'bans'] })
    },
  })

  const bans = data?.data ?? []

  return (
    <FlatList
      data={isLoading ? ([] as BannedUser[]) : bans}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BanRow
          ban={item}
          onUnban={() => unban(item.id)}
          unbanning={isUnbanning && unbanningId === item.id}
        />
      )}
      ListHeaderComponent={
        isLoading ? (
          <View className="px-4 py-3 gap-4">
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
        !isLoading ? (
          <EmptyState
            icon={<Ban size={40} color="#6b7280" />}
            title="No bans"
            message="There are no banned users in this channel."
          />
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor="#a855f7"
        />
      }
    />
  )
}

export function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const channelId = useChannelStore((s) => s.currentChannel?.id) ?? ''

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="Community" />

      {/* Tab bar */}
      <View className="flex-row border-b border-gray-800">
        {(['users', 'bans'] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === tab ? 'border-accent-500' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-medium capitalize ${
                activeTab === tab ? 'text-accent-400' : 'text-gray-500'
              }`}
            >
              {tab === 'users' ? 'Users' : 'Bans'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'users' ? (
        <UsersTab channelId={channelId} />
      ) : (
        <BansTab channelId={channelId} />
      )}
    </View>
  )
}
