import { View, Text, ScrollView } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'

export function StreamScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data, isLoading } = useQuery({
    queryKey: ['stream', broadcasterId],
    queryFn: () => apiClient.get(`/api/stream/${broadcasterId}`).then((r) => r.data),
    enabled: !!broadcasterId,
    refetchInterval: 15_000,
  })

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="Stream Info" />
      {isLoading ? (
        <Skeleton className="h-32 w-full" count={3} />
      ) : (
        <>
          <Card className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">Status</Text>
              <Badge variant={data?.isLive ? 'danger' : 'muted'}>
                {data?.isLive ? 'Live' : 'Offline'}
              </Badge>
            </View>
            {data?.title && <Text className="text-sm text-gray-300">{data.title}</Text>}
            {data?.gameName && <Text className="text-xs text-gray-500">Playing: {data.gameName}</Text>}
          </Card>
          <Card className="gap-3">
            <Text className="text-sm font-semibold text-white">Statistics</Text>
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-500">Viewers</Text>
              <Text className="text-xs text-white">{data?.viewerCount ?? 0}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-500">Followers</Text>
              <Text className="text-xs text-white">{data?.followerCount ?? 0}</Text>
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  )
}
