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
import type { Pipeline } from '@/types/pipeline'

export function PipelinesScreen() {
  const { t } = useFeatureTranslation('pipelines')
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data, isLoading } = useQuery<Pipeline[]>({
    queryKey: ['pipelines', broadcasterId],
    queryFn: () => apiClient.get(`/api/${broadcasterId}/pipelines`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const columns = [
    { key: 'name', title: 'Name', render: (v: string) => <Text className="text-sm text-white">{v}</Text> },
    { key: 'trigger', title: 'Trigger', render: (v: string) => <Badge variant="info" label={v} /> },
    { key: 'isEnabled', title: 'Status', render: (v: boolean) => <Badge variant={v ? 'success' : 'muted'} label={v ? 'Active' : 'Inactive'} />, width: 90 },
  ]

  return (
    <View className="flex-1 bg-gray-950">
      <View className="px-4 pt-4">
        <PageHeader
          title={t('title')}
          rightContent={
            <Button size="sm" onPress={() => router.push('/(dashboard)/pipelines/new' as any)} leftIcon={<Plus size={14} color="white" />}>
              {t('addNew')}
            </Button>
          }
        />
      </View>
      <DataTable
        columns={columns}
        data={data ?? []}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        onRowPress={(p) => router.push(`/(dashboard)/pipelines/${p.id}` as any)}
        emptyMessage={t('empty.title')}
      />
    </View>
  )
}
