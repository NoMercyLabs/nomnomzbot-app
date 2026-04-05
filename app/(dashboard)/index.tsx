import { ScrollView, View, Text } from 'react-native'
import { useApiQuery } from '@/hooks/useApi'
import { useChannel } from '@/hooks/useChannel'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatNumber } from '@/lib/utils/format'
import { Users, MessageSquare, Terminal, Zap } from 'lucide-react-native'

interface DashboardStats {
  viewerCount: number
  followerCount: number
  commandsUsed: number
  messagesCount: number
  isLive: boolean
}

export default function DashboardScreen() {
  const { currentChannel } = useChannel()
  const { data: stats, isLoading } = useApiQuery<DashboardStats>('stats', '/stats')

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader
        title={currentChannel?.displayName ?? 'Dashboard'}
        subtitle={stats?.isLive ? 'LIVE' : 'Offline'}
      />
      <View className="px-6 py-4 gap-4">
        {isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            <StatCard icon={<Users size={20} color="rgb(124,58,237)" />} label="Viewers" value={formatNumber(stats?.viewerCount ?? 0)} />
            <StatCard icon={<Users size={20} color="rgb(59,130,246)" />} label="Followers" value={formatNumber(stats?.followerCount ?? 0)} />
            <StatCard icon={<Terminal size={20} color="rgb(34,197,94)" />} label="Commands Used" value={formatNumber(stats?.commandsUsed ?? 0)} />
            <StatCard icon={<MessageSquare size={20} color="rgb(249,115,22)" />} label="Messages" value={formatNumber(stats?.messagesCount ?? 0)} />
          </View>
        )}
      </View>
    </ScrollView>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex-1 min-w-[140px] p-4 gap-2">
      {icon}
      <Text className="text-2xl font-bold text-gray-100">{value}</Text>
      <Text className="text-sm text-gray-400">{label}</Text>
    </Card>
  )
}
