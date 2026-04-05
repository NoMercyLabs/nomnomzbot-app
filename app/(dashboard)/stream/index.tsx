import { useState } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Radio, Eye, Clock, Tag, GamepadIcon } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChannelStore } from '@/stores/useChannelStore'
import { useSignalR } from '@/hooks/useSignalR'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'
import { useEffect } from 'react'
import type { StreamStatusPayload } from '@/types/signalr'

interface StreamInfo {
  isLive: boolean
  title: string
  gameName: string
  tags: string[]
  viewerCount: number
  startedAt?: string
  thumbnailUrl?: string
  language: string
}

function formatUptime(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View className="flex-1 rounded-xl bg-surface-overlay border border-border p-3 items-center gap-1">
      {icon}
      <Text className="text-lg font-bold text-gray-100">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  )
}

export default function StreamScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()
  const { on, off } = useSignalR()

  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const { data: stream, isLoading, refetch, isRefetching } = useQuery<StreamInfo>({
    queryKey: ['stream', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/stream`).then((r) => r.data),
    enabled: !!broadcasterId,
    refetchInterval: 60000,
  })

  // Live stream status from SignalR
  useEffect(() => {
    on('StreamStatusChanged', (status: StreamStatusPayload) => {
      qc.setQueryData(['stream', broadcasterId], (prev: StreamInfo | undefined) =>
        prev
          ? {
              ...prev,
              isLive: status.isLive,
              title: status.title ?? prev.title,
              gameName: status.gameName ?? prev.gameName,
              tags: status.tags ?? prev.tags,
              viewerCount: status.viewerCount ?? prev.viewerCount,
              startedAt: status.startedAt ?? prev.startedAt,
            }
          : prev,
      )
    })
    return () => off('StreamStatusChanged')
  }, [on, off, broadcasterId, qc])

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; gameName?: string }) =>
      apiClient.patch(`/api/${broadcasterId}/stream`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stream', broadcasterId] })
      toast.success('Stream updated')
      setIsEditing(false)
    },
    onError: () => toast.error('Failed to update stream'),
  })

  function startEdit() {
    setEditTitle(stream?.title ?? '')
    setEditCategory(stream?.gameName ?? '')
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  function saveEdit() {
    updateMutation.mutate({ title: editTitle, gameName: editCategory })
  }

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="Stream Info" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-4"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-3 pt-2">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </View>
        ) : !stream ? null : (
          <>
            {/* Live status */}
            <Card className="flex-row items-center gap-4">
              <View
                className={`h-12 w-12 rounded-xl items-center justify-center ${
                  stream.isLive ? 'bg-red-900/30' : 'bg-surface-overlay'
                }`}
              >
                <Radio size={22} color={stream.isLive ? '#ef4444' : '#5a5b72'} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-bold text-gray-100">
                  {stream.isLive ? 'Live' : 'Offline'}
                </Text>
                {stream.isLive && stream.startedAt && (
                  <Text className="text-sm text-gray-500">
                    Uptime: {formatUptime(stream.startedAt)}
                  </Text>
                )}
              </View>
              <Badge
                variant={stream.isLive ? 'danger' : 'muted'}
                label={stream.isLive ? 'LIVE' : 'OFFLINE'}
              />
            </Card>

            {/* Stats */}
            {stream.isLive && (
              <View className="flex-row gap-2">
                <StatBox
                  label="Viewers"
                  value={stream.viewerCount.toLocaleString()}
                  icon={<Eye size={16} color="#3b82f6" />}
                />
                {stream.startedAt && (
                  <StatBox
                    label="Uptime"
                    value={formatUptime(stream.startedAt)}
                    icon={<Clock size={16} color="#10b981" />}
                  />
                )}
                <StatBox
                  label="Category"
                  value={stream.gameName || '—'}
                  icon={<GamepadIcon size={16} color="#a855f7" />}
                />
              </View>
            )}

            {/* Stream details */}
            <Card className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-gray-300">Stream Details</Text>
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onPress={startEdit} label="Edit" />
                ) : (
                  <View className="flex-row gap-2">
                    <Button variant="ghost" size="sm" onPress={cancelEdit} label="Cancel" />
                    <Button
                      size="sm"
                      onPress={saveEdit}
                      loading={updateMutation.isPending}
                      label="Save"
                    />
                  </View>
                )}
              </View>

              {isEditing ? (
                <>
                  <Input
                    label="Title"
                    value={editTitle}
                    onChangeText={setEditTitle}
                    placeholder="Stream title..."
                  />
                  <Input
                    label="Category / Game"
                    value={editCategory}
                    onChangeText={setEditCategory}
                    placeholder="Just Chatting, Valorant..."
                  />
                </>
              ) : (
                <>
                  <View className="gap-1">
                    <Text className="text-xs text-gray-500">Title</Text>
                    <Text className="text-sm text-gray-200">{stream.title || '—'}</Text>
                  </View>
                  <View className="gap-1">
                    <Text className="text-xs text-gray-500">Category</Text>
                    <Text className="text-sm text-gray-200">{stream.gameName || '—'}</Text>
                  </View>
                </>
              )}

              {stream.tags.length > 0 && (
                <View className="gap-2">
                  <Text className="text-xs text-gray-500">Tags</Text>
                  <View className="flex-row flex-wrap gap-1">
                    {stream.tags.map((tag) => (
                      <View
                        key={tag}
                        className="rounded-full bg-surface-overlay border border-border px-2 py-0.5"
                      >
                        <Text className="text-xs text-gray-400">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  )
}
