import { View, Text, ScrollView, Image, Pressable, RefreshControl } from 'react-native'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Music, SkipForward, Pause, Play, Volume2, Trash2, ChevronUp, ChevronDown,
} from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChannelStore } from '@/stores/useChannelStore'
import { useSignalR } from '@/hooks/useSignalR'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'
import type { MusicStatePayload, MusicTrack } from '@/types/signalr'

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ProgressBar({ progressMs, durationMs }: { progressMs: number; durationMs: number }) {
  const pct = durationMs > 0 ? Math.min((progressMs / durationMs) * 100, 100) : 0
  return (
    <View className="gap-1">
      <View className="h-1 rounded-full bg-gray-700 overflow-hidden">
        <View className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} />
      </View>
      <View className="flex-row justify-between">
        <Text className="text-xs text-gray-500">{formatMs(progressMs)}</Text>
        <Text className="text-xs text-gray-500">{formatMs(durationMs)}</Text>
      </View>
    </View>
  )
}

function NowPlayingCard({
  track,
  isPlaying,
  progressMs,
  durationMs,
  onSkip,
  onTogglePlay,
  isSkipping,
}: {
  track: MusicTrack | null
  isPlaying: boolean
  progressMs: number
  durationMs: number
  onSkip: () => void
  onTogglePlay: () => void
  isSkipping: boolean
}) {
  if (!track) {
    return (
      <Card className="items-center gap-4 py-8">
        <Music size={40} color="#4b5563" />
        <Text className="text-gray-500 text-sm">Nothing playing</Text>
      </Card>
    )
  }

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-4">
        {track.albumArtUrl ? (
          <Image
            source={{ uri: track.albumArtUrl }}
            className="h-16 w-16 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 rounded-xl bg-surface-overlay items-center justify-center">
            <Music size={24} color="#5a5b72" />
          </View>
        )}
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-gray-100" numberOfLines={1}>
            {track.title}
          </Text>
          <Text className="text-sm text-gray-400" numberOfLines={1}>
            {track.artist}
          </Text>
          {track.requestedBy && (
            <Text className="text-xs text-gray-600">
              Requested by @{track.requestedBy}
            </Text>
          )}
        </View>
        <Badge variant={isPlaying ? 'success' : 'muted'} label={isPlaying ? 'Playing' : 'Paused'} />
      </View>

      <ProgressBar progressMs={progressMs} durationMs={durationMs} />

      <View className="flex-row justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onPress={onTogglePlay}
          leftIcon={
            isPlaying
              ? <Pause size={16} color="#e5e7eb" />
              : <Play size={16} color="#e5e7eb" />
          }
          label={isPlaying ? 'Pause' : 'Resume'}
        />
        <Button
          variant="secondary"
          size="sm"
          onPress={onSkip}
          loading={isSkipping}
          leftIcon={<SkipForward size={16} color="#e5e7eb" />}
          label="Skip"
        />
      </View>
    </Card>
  )
}

function QueueItem({
  track,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  track: MusicTrack
  index: number
  total: number
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <Card className="flex-row items-center gap-3 py-2">
      <Text className="text-xs text-gray-600 w-5 text-center">{index + 1}</Text>
      {track.albumArtUrl ? (
        <Image
          source={{ uri: track.albumArtUrl }}
          className="h-10 w-10 rounded-lg"
          resizeMode="cover"
        />
      ) : (
        <View className="h-10 w-10 rounded-lg bg-surface-overlay items-center justify-center">
          <Music size={14} color="#5a5b72" />
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-gray-200" numberOfLines={1}>
          {track.title}
        </Text>
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {track.artist} · {formatMs(track.durationMs)}
        </Text>
        {track.requestedBy && (
          <Text className="text-xs text-gray-600">@{track.requestedBy}</Text>
        )}
      </View>
      <View className="flex-row items-center gap-1">
        {index > 0 && (
          <Pressable onPress={onMoveUp} className="p-1 rounded active:bg-surface-overlay">
            <ChevronUp size={14} color="#8889a0" />
          </Pressable>
        )}
        {index < total - 1 && (
          <Pressable onPress={onMoveDown} className="p-1 rounded active:bg-surface-overlay">
            <ChevronDown size={14} color="#8889a0" />
          </Pressable>
        )}
        <Pressable onPress={onRemove} className="p-1 rounded active:bg-surface-overlay">
          <Trash2 size={14} color="#ef4444" />
        </Pressable>
      </View>
    </Card>
  )
}

export default function MusicScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()
  const { on, off } = useSignalR()

  const { data: musicState, isLoading, refetch, isRefetching } = useQuery<MusicStatePayload>({
    queryKey: ['music', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/music/state`).then((r) => r.data),
    enabled: !!broadcasterId,
    refetchInterval: 5000,
  })

  // Live updates via SignalR
  useEffect(() => {
    on('MusicStateChanged', (state) => {
      qc.setQueryData(['music', broadcasterId], state)
    })
    return () => off('MusicStateChanged')
  }, [on, off, broadcasterId, qc])

  const skipMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/${broadcasterId}/music/skip`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['music', broadcasterId] }),
    onError: () => toast.error('Failed to skip'),
  })

  const togglePlayMutation = useMutation({
    mutationFn: () =>
      apiClient.post(
        `/api/${broadcasterId}/music/${musicState?.isPlaying ? 'pause' : 'resume'}`,
      ).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['music', broadcasterId] }),
    onError: () => toast.error('Failed to toggle playback'),
  })

  const removeFromQueueMutation = useMutation({
    mutationFn: (trackId: string) =>
      apiClient.delete(`/api/${broadcasterId}/music/queue/${trackId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['music', broadcasterId] }),
    onError: () => toast.error('Failed to remove from queue'),
  })

  const moveInQueueMutation = useMutation({
    mutationFn: ({ trackId, direction }: { trackId: string; direction: 'up' | 'down' }) =>
      apiClient.patch(`/api/${broadcasterId}/music/queue/${trackId}/move`, { direction }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['music', broadcasterId] }),
    onError: () => toast.error('Failed to reorder queue'),
  })

  const clearQueueMutation = useMutation({
    mutationFn: () =>
      apiClient.delete(`/api/${broadcasterId}/music/queue`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['music', broadcasterId] })
      toast.success('Queue cleared')
    },
    onError: () => toast.error('Failed to clear queue'),
  })

  const queue = musicState?.queue ?? []

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title="Music"
        subtitle={queue.length > 0 ? `${queue.length} in queue` : undefined}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-4"
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
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </View>
        ) : (
          <>
            <NowPlayingCard
              track={musicState?.currentTrack ?? null}
              isPlaying={musicState?.isPlaying ?? false}
              progressMs={musicState?.progressMs ?? 0}
              durationMs={musicState?.durationMs ?? 0}
              onSkip={() => skipMutation.mutate()}
              onTogglePlay={() => togglePlayMutation.mutate()}
              isSkipping={skipMutation.isPending}
            />

            {/* Queue */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-gray-300">
                  Up Next {queue.length > 0 && `(${queue.length})`}
                </Text>
                {queue.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => clearQueueMutation.mutate()}
                    loading={clearQueueMutation.isPending}
                    leftIcon={<Trash2 size={13} color="#ef4444" />}
                    label="Clear"
                  />
                )}
              </View>

              {queue.length === 0 ? (
                <EmptyState
                  title="Queue is empty"
                  message="Viewers can request songs with !sr in chat."
                />
              ) : (
                queue.map((track, index) => (
                  <QueueItem
                    key={track.id}
                    track={track}
                    index={index}
                    total={queue.length}
                    onRemove={() => removeFromQueueMutation.mutate(track.id)}
                    onMoveUp={() => moveInQueueMutation.mutate({ trackId: track.id, direction: 'up' })}
                    onMoveDown={() => moveInQueueMutation.mutate({ trackId: track.id, direction: 'down' })}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}
