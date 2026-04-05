import { View, Text, ScrollView } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { PipelineBuilder } from '@/features/pipelines/components/PipelineBuilder'
import type { PipelineGraph } from '@/types/pipeline'

export function PipelineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useFeatureTranslation('pipelines')
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const qc = useQueryClient()
  const isNew = id === 'new'

  const { data, isLoading } = useQuery({
    queryKey: ['pipelines', broadcasterId, id],
    queryFn: () => apiClient.get(`/api/${broadcasterId}/pipelines/${id}`).then((r) => r.data),
    enabled: !!broadcasterId && !isNew,
  })

  const saveMutation = useMutation({
    mutationFn: (graph: PipelineGraph) =>
      isNew
        ? apiClient.post(`/api/${broadcasterId}/pipelines`, { graph })
        : apiClient.put(`/api/${broadcasterId}/pipelines/${id}`, { graph }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipelines', broadcasterId] })
      router.back()
    },
  })

  return (
    <View className="flex-1 bg-gray-950">
      <View className="px-4 pt-4">
        <PageHeader
          title={isNew ? 'New Pipeline' : (data?.name ?? 'Pipeline')}
          showBack
        />
      </View>
      <PipelineBuilder
        pipeline={data}
        onSave={(pipeline) => saveMutation.mutate(pipeline.graph)}
      />
    </View>
  )
}
