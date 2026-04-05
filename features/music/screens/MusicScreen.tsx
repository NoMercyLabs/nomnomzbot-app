import { useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Play, Pause, SkipForward, SkipBack, Volume2, Music2, X } from 'lucide-react-native'
import { useChannelStore } from '@/stores/useChannelStore'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getNowPlaying,
  getQueue,
  getHistory,
  controlPlayback,
  addToQueue,
  removeFromQueue,
} from '../api'
import type { NowPlaying, QueueItem, HistoryItem } from '../types'

const fmtDuration = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const TABS = [
  { key: 'nowplaying', label: 'Now Playing' },
  { key: 'queue', label: 'Queue' },
  { key: 'history', label: 'History' },
]

// ---------------------------------------------------------------------------
// Now Playing Card
// ---------------------------------------------------------------------------

function NowPlayingCard({
  channelId,
  np,
  isLoading,
}: {
  channelId: string
  np: NowPlaying | undefined
  isLoading: boolean
}) {
  const qc = useQueryClient()

  const control = useMutation({
    mutationFn: ({
      action,
      value,
    }: {
      action: 'play' | 'pause' | 'skip' | 'previous' | 'volume'
      value?: number
    }) => controlPlayback(channelId, action, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['music', 'now-playing', channelId] })
      qc.invalidateQueries({ queryKey: ['music', 'queue', channelId] })
    },
  })

  const progressPct =
    np && np.durationMs > 0 ? (np.progressMs / np.durationMs) * 100 : 0

  return (
    <Card className="items-center gap-4 py-6 px-4 mx-4 mt-4">
      {/* Album art */}
      {isLoading ? (
        <Skeleton className="h-32 w-32 rounded-xl" />
      ) : (
        <View className="h-32 w-32 rounded-xl bg-gray-800 items-center justify-center overflow-hidden">
          {np?.imageUrl ? (
            <Image
              source={{ uri: np.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <Text className="text-4xl">🎵</Text>
          )}
        </View>
      )}

      {/* Track info */}
      {isLoading ? (
        <View className="items-center gap-2 w-full px-8">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </View>
      ) : (
        <View className="items-center gap-1 w-full px-4">
          <Text className="text-base font-semibold text-white text-center" numberOfLines={1}>
            {np?.trackName ?? 'Nothing playing'}
          </Text>
          {np?.artist ? (
            <Text className="text-sm text-gray-400" numberOfLines={1}>
              {np.artist}
              {np.album ? ` · ${np.album}` : ''}
            </Text>
          ) : null}
          {np?.requestedBy ? (
            <Text className="text-xs text-gray-600 mt-0.5">
              Requested by {np.requestedBy}
            </Text>
          ) : null}
        </View>
      )}

      {/* Progress bar */}
      <View className="w-full px-4 gap-1">
        <View className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <View
            className="h-full rounded-full bg-accent-500"
            style={{ width: `${progressPct}%` }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-600">
            {np ? fmtDuration(np.progressMs) : '0:00'}
          </Text>
          <Text className="text-xs text-gray-600">
            {np ? fmtDuration(np.durationMs) : '0:00'}
          </Text>
        </View>
      </View>

      {/* Playback controls */}
      <View className="flex-row items-center gap-6">
        <Pressable
          onPress={() => control.mutate({ action: 'previous' })}
          className="p-2"
          disabled={control.isPending}
        >
          <SkipBack size={24} color="#9ca3af" />
        </Pressable>
        <Pressable
          onPress={() =>
            control.mutate({ action: np?.isPlaying ? 'pause' : 'play' })
          }
          className="h-12 w-12 rounded-full bg-accent-500 items-center justify-center active:bg-accent-600"
          disabled={control.isPending}
        >
          {np?.isPlaying ? (
            <Pause size={22} color="white" />
          ) : (
            <Play size={22} color="white" />
          )}
        </Pressable>
        <Pressable
          onPress={() => control.mutate({ action: 'skip' })}
          className="p-2"
          disabled={control.isPending}
        >
          <SkipForward size={24} color="#9ca3af" />
        </Pressable>
      </View>

      {/* Volume indicator */}
      {np != null && (
        <View className="flex-row items-center gap-2">
          <Volume2 size={14} color="#6b7280" />
          <Text className="text-xs text-gray-500">{np.volume}%</Text>
          <Text className="text-xs text-gray-700 ml-2 capitalize">{np.provider}</Text>
        </View>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Queue Tab
// ---------------------------------------------------------------------------

function QueueTab({ channelId }: { channelId: string }) {
  const qc = useQueryClient()
  const [query, setQuery] = useState('')

  const { data: queue, isLoading, refetch, isRefetching } = useQuery<QueueItem[]>({
    queryKey: ['music', 'queue', channelId],
    queryFn: () => getQueue(channelId),
    enabled: !!channelId,
  })

  const addMutation = useMutation({
    mutationFn: (q: string) => addToQueue(channelId, q),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['music', 'queue', channelId] })
      setQuery('')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (position: number) => removeFromQueue(channelId, position),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['music', 'queue', channelId] }),
  })

  const handleAdd = useCallback(() => {
    if (query.trim()) addMutation.mutate(query.trim())
  }, [query, addMutation])

  const renderItem = ({ item }: { item: QueueItem }) => (
    <View className="flex-row items-center gap-3 py-2.5 border-b border-gray-800/50">
      <Text className="text-xs text-gray-600 w-5 text-right">{item.position}</Text>
      <View className="h-10 w-10 rounded-lg bg-gray-800 items-center justify-center overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: 40, height: 40 }}
            contentFit="cover"
          />
        ) : (
          <Text className="text-base">🎵</Text>
        )}
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm text-gray-200" numberOfLines={1}>
          {item.trackName}
        </Text>
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {item.artist}
          {item.requestedBy ? ` · ${item.requestedBy}` : ''}
        </Text>
      </View>
      <Text className="text-xs text-gray-600 mr-1">{fmtDuration(item.durationMs)}</Text>
      <Pressable
        onPress={() => removeMutation.mutate(item.position)}
        className="p-1.5"
        disabled={removeMutation.isPending}
      >
        <X size={16} color="#6b7280" />
      </Pressable>
    </View>
  )

  return (
    <View className="flex-1">
      {/* Add to queue input */}
      <View className="flex-row items-center gap-2 px-4 py-3 border-b border-gray-800">
        <TextInput
          className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100 text-sm"
          placeholder="Search or paste Spotify URI..."
          placeholderTextColor="#6b7280"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Button
          label="Add"
          onPress={handleAdd}
          size="sm"
          disabled={!query.trim() || addMutation.isPending}
        />
      </View>

      {isLoading ? (
        <View className="gap-2 p-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </View>
      ) : (
        <FlatList
          data={queue ?? []}
          keyExtractor={(item) => String(item.position)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Music2 size={48} color="#9ca3af" />}
              title="Queue is empty"
              message="Add songs using the input above"
            />
          }
        />
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// History Tab
// ---------------------------------------------------------------------------

function HistoryTab({ channelId }: { channelId: string }) {
  const { data: history, isLoading, refetch, isRefetching } = useQuery<HistoryItem[]>({
    queryKey: ['music', 'history', channelId],
    queryFn: () => getHistory(channelId),
    enabled: !!channelId,
  })

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View className="flex-row items-center gap-3 py-2.5 border-b border-gray-800/50">
      <View className="h-10 w-10 rounded-lg bg-gray-800 items-center justify-center overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: 40, height: 40 }}
            contentFit="cover"
          />
        ) : (
          <Text className="text-base">🎵</Text>
        )}
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm text-gray-200" numberOfLines={1}>
          {item.trackName}
        </Text>
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {item.artist}
          {item.requestedBy ? ` · ${item.requestedBy}` : ''}
        </Text>
      </View>
      <Text className="text-xs text-gray-600 text-right">
        {formatDistanceToNow(new Date(item.playedAt), { addSuffix: true })}
      </Text>
    </View>
  )

  if (isLoading) {
    return (
      <View className="gap-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </View>
    )
  }

  return (
    <FlatList
      data={history ?? []}
      keyExtractor={(item, index) => `${item.trackName}-${index}`}
      renderItem={renderItem}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />
      }
      ListEmptyComponent={
        <EmptyState
          icon={<Music2 size={48} color="#9ca3af" />}
          title="No history yet"
          message="Songs played will appear here"
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export function MusicScreen() {
  const { t: tRaw } = useFeatureTranslation('music')
  const t = tRaw as (key: string) => string
  const channelId = useChannelStore((s) => s.currentChannel?.id ?? '')
  const [activeTab, setActiveTab] = useState('nowplaying')

  const { data: nowPlaying, isLoading: npLoading } = useQuery<NowPlaying>({
    queryKey: ['music', 'now-playing', channelId],
    queryFn: () => getNowPlaying(channelId),
    enabled: !!channelId,
    refetchInterval: 5000,
  })

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title={t('title')} />

      <NowPlayingCard
        channelId={channelId}
        np={nowPlaying}
        isLoading={npLoading}
      />

      <Tabs
        tabs={TABS}
        activeKey={activeTab}
        onChange={setActiveTab}
        className="mt-2"
      />

      <View className="flex-1">
        {activeTab === 'nowplaying' && (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-gray-500 text-sm text-center">
              {nowPlaying
                ? `Playing from ${nowPlaying.provider}`
                : 'No track currently playing'}
            </Text>
          </View>
        )}
        {activeTab === 'queue' && <QueueTab channelId={channelId} />}
        {activeTab === 'history' && <HistoryTab channelId={channelId} />}
      </View>
    </View>
  )
}
