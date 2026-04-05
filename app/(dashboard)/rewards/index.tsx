import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApiQuery } from '@/hooks/useApi'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Text } from 'react-native'

interface Reward {
  id: string
  name: string
  cost: number
  enabled: boolean
}

export default function RewardsScreen() {
  const { data: rewards, isLoading } = useApiQuery<Reward[]>('rewards', '/rewards')

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Rewards" />
      <View className="px-6 py-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          : rewards?.map((r) => (
              <Card key={r.id} className="flex-row items-center justify-between p-4">
                <Text className="text-gray-100 font-medium">{r.name}</Text>
                <Text className="text-accent-400 font-semibold">{r.cost.toLocaleString()} pts</Text>
              </Card>
            ))}
      </View>
    </ScrollView>
  )
}
