import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Server, Cpu, HardDrive, Clock, Activity, AlertTriangle } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { apiClient } from '@/lib/api/client'

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: string
  nodeVersion: string
  cpuPercent: number
  memoryUsedMb: number
  memoryTotalMb: number
  services: {
    name: string
    status: 'up' | 'down' | 'degraded'
    latencyMs?: number
    message?: string
  }[]
  recentErrors: {
    message: string
    count: number
    lastSeen: string
  }[]
}

function ServiceRow({ service }: { service: SystemHealth['services'][0] }) {
  return (
    <View className="flex-row items-center gap-3 py-2 border-b border-border last:border-b-0">
      <View
        className={`h-2 w-2 rounded-full ${
          service.status === 'up' ? 'bg-green-500' :
          service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
        }`}
      />
      <Text className="flex-1 text-sm text-gray-200">{service.name}</Text>
      {service.latencyMs != null && (
        <Text className="text-xs text-gray-500">{service.latencyMs}ms</Text>
      )}
      <Badge
        variant={service.status === 'up' ? 'success' : service.status === 'degraded' ? 'warning' : 'danger'}
        label={service.status.charAt(0).toUpperCase() + service.status.slice(1)}
      />
    </View>
  )
}

function MetricBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="text-xs text-gray-400">{value} / {max}</Text>
      </View>
      <View className="h-2 rounded-full bg-gray-700 overflow-hidden">
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  )
}

export default function AdminSystemScreen() {
  const { data: health, isLoading, refetch, isRefetching } = useQuery<SystemHealth>({
    queryKey: ['admin', 'system'],
    queryFn: () => apiClient.get('/api/admin/system').then((r) => r.data),
    refetchInterval: 15000,
  })

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="System Health" showBack />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </View>
        ) : health ? (
          <>
            {/* Overall status */}
            <Card className="flex-row items-center gap-4">
              <View
                className={`h-12 w-12 rounded-xl items-center justify-center ${
                  health.status === 'healthy' ? 'bg-green-900/30' :
                  health.status === 'degraded' ? 'bg-yellow-900/30' : 'bg-red-900/30'
                }`}
              >
                <Activity
                  size={22}
                  color={
                    health.status === 'healthy' ? '#10b981' :
                    health.status === 'degraded' ? '#f59e0b' : '#ef4444'
                  }
                />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-bold text-gray-100">
                  System {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                </Text>
                <Text className="text-sm text-gray-500">v{health.version} · Node {health.nodeVersion}</Text>
              </View>
              <Badge
                variant={health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'warning' : 'danger'}
                label={health.status}
              />
            </Card>

            {/* System metrics */}
            <Card className="gap-4">
              <Text className="text-sm font-semibold text-gray-300">Resources</Text>
              <MetricBar
                label="CPU Usage"
                value={health.cpuPercent}
                max={100}
                color={health.cpuPercent > 80 ? '#ef4444' : health.cpuPercent > 60 ? '#f59e0b' : '#10b981'}
              />
              <MetricBar
                label="Memory (MB)"
                value={health.memoryUsedMb}
                max={health.memoryTotalMb}
                color={
                  (health.memoryUsedMb / health.memoryTotalMb) > 0.8 ? '#ef4444' :
                  (health.memoryUsedMb / health.memoryTotalMb) > 0.6 ? '#f59e0b' : '#10b981'
                }
              />
              <View className="flex-row items-center gap-2">
                <Clock size={14} color="#5a5b72" />
                <Text className="text-xs text-gray-500">Uptime: {health.uptime}</Text>
              </View>
            </Card>

            {/* Services */}
            <Card className="gap-2">
              <Text className="text-sm font-semibold text-gray-300">Services</Text>
              {health.services.map((s) => (
                <ServiceRow key={s.name} service={s} />
              ))}
            </Card>

            {/* Recent errors */}
            {health.recentErrors.length > 0 && (
              <Card className="gap-3">
                <View className="flex-row items-center gap-2">
                  <AlertTriangle size={16} color="#f59e0b" />
                  <Text className="text-sm font-semibold text-gray-300">Recent Errors</Text>
                </View>
                {health.recentErrors.map((err, i) => (
                  <View key={i} className="rounded-lg bg-red-950/30 border border-red-900/40 px-3 py-2 gap-1">
                    <Text className="text-xs text-red-300" numberOfLines={2}>{err.message}</Text>
                    <Text className="text-xs text-gray-600">
                      {err.count}× · last {new Date(err.lastSeen).toLocaleTimeString()}
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  )
}
