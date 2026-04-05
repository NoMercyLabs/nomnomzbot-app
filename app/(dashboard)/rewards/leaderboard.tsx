import { ScrollView, View, Text } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApiQuery } from '@/hooks/useApi'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  points: number
}

export default function LeaderboardScreen() {
  const { data: entries, isLoading } = useApiQuery<LeaderboardEntry[]>('leaderboard', '/rewards/leaderboard')

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Leaderboard" backHref="/(dashboard)/rewards" />
      <View className="px-6 py-4 gap-3">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
          : entries?.map((e) => (
              <Card key={e.userId} className="flex-row items-center gap-4 p-4">
                <Text className="text-2xl font-bold text-gray-500 w-8">#{e.rank}</Text>
                <Text className="flex-1 text-gray-100 font-medium">{e.displayName}</Text>
                <Text className="text-accent-400 font-semibold">{e.points.toLocaleString()}</Text>
              </Card>
            ))}
      </View>
    </ScrollView>
  )
}
