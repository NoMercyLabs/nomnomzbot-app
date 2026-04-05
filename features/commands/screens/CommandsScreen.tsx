import { View, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/compound/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Plus, Terminal } from 'lucide-react-native'
import { EmptyState } from '@/components/ui/EmptyState'
import { Text } from 'react-native'
import type { Command } from '../types'

export function CommandsScreen() {
  const { t } = useFeatureTranslation('commands')
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data, isLoading } = useQuery<Command[]>({
    queryKey: ['commands', broadcasterId],
    queryFn: () => apiClient.get(`/api/${broadcasterId}/commands`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const columns = [
    {
      key: 'name',
      title: 'Command',
      render: (val: string) => <Text className="font-mono text-sm text-accent-400">{val}</Text>,
    },
    {
      key: 'response',
      title: 'Response',
      render: (val: string) => <Text className="text-sm text-gray-300" numberOfLines={1}>{val}</Text>,
    },
    {
      key: 'permission',
      title: 'Permission',
      render: (val: string) => <Badge variant="muted" label={val} />,
      width: 120,
    },
    {
      key: 'enabled',
      title: 'Status',
      render: (val: boolean) => <Badge variant={val ? 'success' : 'muted'} label={val ? 'Enabled' : 'Disabled'} />,
      width: 90,
    },
  ]

  return (
    <View className="flex-1 bg-gray-950">
      <View className="px-4 pt-4">
        <PageHeader
          title={t('title')}
          rightContent={
            <Button
              size="sm"
              onPress={() => router.push('/(dashboard)/commands/new' as any)}
              leftIcon={<Plus size={14} color="white" />}
            >
              {t('addNew')}
            </Button>
          }
        />
      </View>
      <DataTable
        columns={columns}
        data={data ?? []}
        keyExtractor={(cmd) => cmd.id}
        isLoading={isLoading}
        onRowPress={(cmd) => router.push(`/(dashboard)/commands/${cmd.name}` as any)}
        emptyMessage={t('empty.title')}
      />
    </View>
  )
}
