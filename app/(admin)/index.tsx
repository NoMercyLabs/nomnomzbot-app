import { View, Text, ScrollView, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Users, Hash, Activity, Server, ChevronRight } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

interface AdminStats {
  totalChannels: number
  activeChannels: number
  totalUsers: number
  systemStatus: 'healthy' | 'degraded' | 'down'
  botUptimeSeconds: number
  eventsProcessedToday: number
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

function StatCard({ label, value, icon, color }: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card className="flex-1 px-4 py-4 gap-2 min-w-[45%]">
      <View className="flex-row items-center gap-2">
        <View style={{ opacity: 0.8 }}>{icon}</View>
        <Text className="text-xs text-gray-500 uppercase tracking-wider">{label}</Text>
      </View>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
    </Card>
  )
}

function NavRow({ label, href }: { label: string; href: string }) {
  return (
    <Pressable onPress={() => router.push(href as any)}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border last:border-b-0">
        <Text className="text-sm text-gray-100">{label}</Text>
        <ChevronRight size={16} color="rgb(107,114,128)" />
      </View>
    </Pressable>
  )
}

export default function AdminDashboardScreen() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminStats }>('/v1/admin/stats')
      return res.data.data
    },
    refetchInterval: 30_000,
  })

  const statusVariant = data?.systemStatus === 'healthy' ? 'success'
    : data?.systemStatus === 'degraded' ? 'warning'
    : 'danger'

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8">
      <PageHeader
        title="Admin Dashboard"
        rightContent={
          data ? (
            <Badge
              variant={statusVariant}
              label={data.systemStatus === 'healthy' ? 'All Systems OK' : data.systemStatus}
            />
          ) : undefined
        }
      />

      <View className="px-4 pt-4 gap-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" count={3} />
        ) : (
          <>
            <View className="flex-row flex-wrap gap-3">
              <StatCard
                label="Channels"
                value={data?.totalChannels ?? 0}
                icon={<Hash size={16} color="rgb(139,92,246)" />}
                color="text-accent-300"
              />
              <StatCard
                label="Active"
                value={data?.activeChannels ?? 0}
                icon={<Activity size={16} color="rgb(74,222,128)" />}
                color="text-green-300"
              />
              <StatCard
                label="Users"
                value={data?.totalUsers ?? 0}
                icon={<Users size={16} color="rgb(59,130,246)" />}
                color="text-blue-300"
              />
              <StatCard
                label="Events Today"
                value={(data?.eventsProcessedToday ?? 0).toLocaleString()}
                icon={<Server size={16} color="rgb(245,158,11)" />}
                color="text-amber-300"
              />
              <StatCard
                label="Bot Uptime"
                value={data?.botUptimeSeconds != null ? formatUptime(data.botUptimeSeconds) : '—'}
                icon={<Activity size={16} color="rgb(16,185,129)" />}
                color="text-green-300"
              />
            </View>

            <Card>
              <CardHeader title="Admin Navigation" />
              <NavRow label="Channels" href="/(admin)/channels" />
              <NavRow label="Users" href="/(admin)/users" />
              <NavRow label="System Health" href="/(admin)/system" />
            </Card>
          </>
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
