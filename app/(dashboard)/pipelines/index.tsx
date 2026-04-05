import { ScrollView, View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus, Edit } from 'lucide-react-native'
import type { Pipeline } from '@/types/pipeline'

export default function PipelinesScreen() {
  const router = useRouter()
  const { data: pipelines, isLoading } = useApiQuery<Pipeline[]>('pipelines', '/pipelines')

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader
        title="Pipelines"
        action={
          <Pressable
            onPress={() => router.push('/(dashboard)/pipelines/new' as any)}
            className="flex-row items-center gap-2 rounded-lg bg-accent-600 px-4 py-2"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-medium">New</Text>
          </Pressable>
        }
      />
      <View className="px-6 py-4 gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          : pipelines?.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/(dashboard)/pipelines/${p.id}` as any)}>
                <Card className="p-4 gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-100 font-medium">{p.name}</Text>
                    <Badge label={p.isEnabled ? 'Active' : 'Disabled'} variant={p.isEnabled ? 'success' : 'secondary'} />
                  </View>
                  {p.description && <Text className="text-gray-400 text-sm">{p.description}</Text>}
                  <Text className="text-gray-500 text-xs">{p.graph.nodes.length} nodes</Text>
                </Card>
              </Pressable>
            ))}
      </View>
    </ScrollView>
  )
}
