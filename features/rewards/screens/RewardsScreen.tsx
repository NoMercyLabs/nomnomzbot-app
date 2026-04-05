import { View, Text } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/compound/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Plus } from 'lucide-react-native'

interface Reward {
  id: string
  title: string
  cost: number
  enabled: boolean
}

export function RewardsScreen() {
  const { t } = useFeatureTranslation('rewards')
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data, isLoading } = useQuery<Reward[]>({
    queryKey: ['rewards', broadcasterId],
    queryFn: () => apiClient.get(`/api/${broadcasterId}/rewards`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const columns = [
    { key: 'title', title: 'Reward', render: (v: string) => <Text className="text-sm text-white">{v}</Text> },
    { key: 'cost', title: 'Cost', render: (v: number) => <Text className="text-sm text-yellow-400">{v.toLocaleString()}</Text>, width: 90 },
    { key: 'enabled', title: 'Status', render: (v: boolean) => <Badge variant={v ? 'success' : 'muted'} label={v ? 'Enabled' : 'Disabled'} />, width: 90 },
  ]

  return (
    <View className="flex-1 bg-gray-950">
      <View className="px-4 pt-4">
        <PageHeader
          title={t('title')}
          rightContent={
            <Button size="sm" onPress={() => {}} leftIcon={<Plus size={14} color="white" />}>
              {t('addNew')}
            </Button>
          }
        />
      </View>
      <DataTable
        columns={columns}
        data={data ?? []}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyMessage={t('empty.title')}
      />
    </View>
  )
}
