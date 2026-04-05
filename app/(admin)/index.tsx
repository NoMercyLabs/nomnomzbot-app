import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Users, Radio, Server, Activity, AlertTriangle, ChevronRight } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { apiClient } from '@/lib/api/client'

interface AdminStats {
  totalChannels: number
  activeChannels: number
  totalUsers: number
  activeConnections: number
  cpuPercent: number
  memoryPercent: number
  uptime: string
  version: string
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="flex-1 gap-2 items-center py-4">
      <View
        className="h-10 w-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </View>
      <Text className="text-xl font-bold text-gray-100">{value}</Text>
      <Text className="text-xs text-gray-500 text-center">{label}</Text>
    </Card>
  )
}

function NavCard({ title, subtitle, href, icon, color }: { title: string; subtitle: string; href: string; icon: React.ReactNode; color: string }) {
  return (
    <Pressable onPress={() => router.push(href as any)} className="active:opacity-70">
      <Card className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-gray-100">{title}</Text>
          <Text className="text-xs text-gray-500">{subtitle}</Text>
        </View>
        <ChevronRight size={16} color="#5a5b72" />
      </Card>
    </Pressable>
  )
}

export default function AdminDashboardScreen() {
  const { data: stats, isLoading, refetch, isRefetching } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.get('/api/admin/stats').then((r) => r.data),
    refetchInterval: 30000,
  })

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="Admin" subtitle={stats?.version} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </View>
        ) : stats ? (
          <>
            {/* Stats grid */}
            <View className="flex-row gap-2">
              <StatCard
                label="Channels"
                value={stats.totalChannels}
                color="#3b82f6"
                icon={<Radio size={18} color="#3b82f6" />}
              />
              <StatCard
                label="Active"
                value={stats.activeChannels}
                color="#10b981"
                icon={<Activity size={18} color="#10b981" />}
              />
            </View>
            <View className="flex-row gap-2">
              <StatCard
                label="Users"
                value={stats.totalUsers}
                color="#a855f7"
                icon={<Users size={18} color="#a855f7" />}
              />
              <StatCard
                label="Connections"
                value={stats.activeConnections}
                color="#f59e0b"
                icon={<Server size={18} color="#f59e0b" />}
              />
            </View>

            {/* System health */}
            <Card className="gap-3">
              <Text className="text-sm font-semibold text-gray-300">System Health</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-500">CPU</Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-24 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${stats.cpuPercent}%`,
                        backgroundColor: stats.cpuPercent > 80 ? '#ef4444' : stats.cpuPercent > 60 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-400 w-8">{stats.cpuPercent}%</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-500">Memory</Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-24 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${stats.memoryPercent}%`,
                        backgroundColor: stats.memoryPercent > 80 ? '#ef4444' : stats.memoryPercent > 60 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-400 w-8">{stats.memoryPercent}%</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-500">Uptime</Text>
                <Text className="text-xs text-gray-300">{stats.uptime}</Text>
              </View>
            </Card>
          </>
        ) : null}

        {/* Navigation */}
        <View className="gap-2">
          <NavCard
            title="Channels"
            subtitle="Manage all registered channels"
            href="/(admin)/channels"
            color="#3b82f6"
            icon={<Radio size={18} color="#3b82f6" />}
          />
          <NavCard
            title="Users"
            subtitle="Manage user accounts"
            href="/(admin)/users"
            color="#a855f7"
            icon={<Users size={18} color="#a855f7" />}
          />
          <NavCard
            title="System"
            subtitle="Logs, health, and configuration"
            href="/(admin)/system"
            color="#10b981"
            icon={<Server size={18} color="#10b981" />}
          />
        </View>
      </ScrollView>
    </View>
  )
}
