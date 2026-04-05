import { View, Text } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useChannelStore } from '@/stores/useChannelStore'
import { format } from 'date-fns'

export function StreamStatus() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data } = useQuery({
    queryKey: ['stream', 'status', broadcasterId],
    queryFn: () => apiClient.get(`/api/stream/${broadcasterId}/status`).then((r) => r.data),
    enabled: !!broadcasterId,
    refetchInterval: 15_000,
  })

  const isLive = data?.isLive ?? false

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-white">Stream Status</Text>
        <Badge variant={isLive ? 'danger' : 'muted'} dot>
          {isLive ? 'Live' : 'Offline'}
        </Badge>
      </View>
      {data?.title && (
        <Text className="text-sm text-gray-300" numberOfLines={1}>{data.title}</Text>
      )}
      {data?.gameName && (
        <Text className="text-xs text-gray-500">{data.gameName}</Text>
      )}
      {isLive && data?.startedAt && (
        <Text className="text-xs text-gray-500">
          Started {format(new Date(data.startedAt), 'h:mm a')}
        </Text>
      )}
    </Card>
  )
}
