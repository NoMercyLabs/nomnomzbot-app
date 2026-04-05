import { View, Text, ScrollView, Pressable, Image } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Play, Pause, SkipForward, SkipBack, Volume2, Shuffle, Repeat } from 'lucide-react-native'

export function MusicScreen() {
  const { t: tRaw } = useFeatureTranslation('music')
  const t = tRaw as (key: string) => string
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['music', broadcasterId],
    queryFn: () => apiClient.get(`/api/${broadcasterId}/music`).then((r) => r.data),
    enabled: !!broadcasterId,
    refetchInterval: 5000,
  })

  const control = useMutation({
    mutationFn: (action: string) =>
      apiClient.post(`/api/${broadcasterId}/music/${action}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['music', broadcasterId] }),
  })

  const np = data?.nowPlaying

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title={t('title')} />

      <Card className="items-center gap-4 py-6">
        {isLoading ? (
          <Skeleton className="h-32 w-32 rounded-xl" />
        ) : (
          <View className="h-32 w-32 rounded-xl bg-gray-800 items-center justify-center overflow-hidden">
            {np?.thumbnail ? (
              <Image source={{ uri: np.thumbnail }} className="w-full h-full" />
            ) : (
              <Text className="text-4xl">🎵</Text>
            )}
          </View>
        )}

        <View className="items-center gap-1">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {np?.title ?? 'Nothing playing'}
          </Text>
          {np?.artist && (
            <Text className="text-sm text-gray-500">{np.artist}</Text>
          )}
        </View>

        <View className="flex-row items-center gap-6">
          <Pressable onPress={() => control.mutate('previous')} className="p-2">
            <SkipBack size={24} color="#9ca3af" />
          </Pressable>
          <Pressable
            onPress={() => control.mutate(np?.isPlaying ? 'pause' : 'play')}
            className="h-12 w-12 rounded-full bg-accent-500 items-center justify-center active:bg-accent-600"
          >
            {np?.isPlaying ? <Pause size={22} color="white" /> : <Play size={22} color="white" />}
          </Pressable>
          <Pressable onPress={() => control.mutate('skip')} className="p-2">
            <SkipForward size={24} color="#9ca3af" />
          </Pressable>
        </View>
      </Card>

      <Card>
        <Text className="text-sm font-semibold text-white mb-3">{t('queue')}</Text>
        {(data?.queue ?? []).slice(0, 10).map((track: any, i: number) => (
          <View key={track.id} className="flex-row items-center gap-3 py-2 border-b border-gray-800/50">
            <Text className="text-xs text-gray-600 w-5">{i + 1}</Text>
            <View className="flex-1">
              <Text className="text-sm text-gray-200" numberOfLines={1}>{track.title}</Text>
              <Text className="text-xs text-gray-600">{track.artist}</Text>
            </View>
          </View>
        ))}
        {(!data?.queue || data.queue.length === 0) && (
          <Text className="text-sm text-gray-600 py-4 text-center">{t('empty.queue')}</Text>
        )}
      </Card>
    </ScrollView>
  )
}
