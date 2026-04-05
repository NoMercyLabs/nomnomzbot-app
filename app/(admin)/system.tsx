import { View, Text, ScrollView } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Activity } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

interface ServiceHealth {
  name: string
  status: 'up' | 'degraded' | 'down'
  latencyMs: number | null
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down'
  services: ServiceHealth[]
  botVersion: string
  memoryUsageMb: number | null
  cpuPercent: number | null
}

function ServiceRow({ service }: { service: ServiceHealth }) {
  const variant = service.status === 'up' ? 'success' : service.status === 'degraded' ? 'warning' : 'danger'
  const label = service.status === 'up' ? 'Up' : service.status === 'degraded' ? 'Degraded' : 'Down'

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-border last:border-b-0">
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-gray-100">{service.name}</Text>
        {service.latencyMs != null && (
          <Text className="text-xs text-gray-500">{service.latencyMs}ms latency</Text>
        )}
      </View>
      <Badge variant={variant} label={label} />
    </View>
  )
}

export default function AdminSystemScreen() {
  const { data, isLoading, refetch, isFetching } = useQuery<SystemHealth>({
    queryKey: ['admin', 'system'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: SystemHealth }>('/v1/admin/system')
      return res.data.data
    },
    refetchInterval: 30_000,
  })

  const overallVariant = data?.overall === 'healthy' ? 'success'
    : data?.overall === 'degraded' ? 'warning'
    : 'danger'

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8">
      <PageHeader
        title="System Health"
        backHref="/(admin)"
        rightContent={
          <Button
            size="sm"
            variant="ghost"
            label={isFetching ? 'Refreshing…' : 'Refresh'}
            onPress={() => refetch()}
          />
        }
      />

      <View className="px-4 pt-4 gap-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" count={4} />
        ) : (
          <>
            {/* Overall status */}
            <Card className="px-4 py-4 flex-row items-center gap-3">
              <Activity size={24} color="rgb(139,92,246)" />
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-100">Overall Status</Text>
                {data?.botVersion && (
                  <Text className="text-xs text-gray-500">
                    v{data.botVersion}
                  </Text>
                )}
              </View>
              {data && <Badge variant={overallVariant} label={data.overall} />}
            </Card>

            {/* Resource usage */}
            {(data?.memoryUsageMb != null || data?.cpuPercent != null) && (
              <Card>
                <CardHeader title="Resource Usage" />
                <View className="px-4 py-2">
                  {data.memoryUsageMb != null && (
                    <View className="flex-row justify-between py-2 border-b border-border">
                      <Text className="text-sm text-gray-400">Memory</Text>
                      <Text className="text-sm text-gray-100">
                        {data.memoryUsageMb.toFixed(0)} MB
                      </Text>
                    </View>
                  )}
                  {data.cpuPercent != null && (
                    <View className="flex-row justify-between py-2">
                      <Text className="text-sm text-gray-400">CPU</Text>
                      <Text className="text-sm text-gray-100">
                        {data.cpuPercent.toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            )}

            {/* Services */}
            {data?.services && data.services.length > 0 && (
              <Card>
                <CardHeader title="Services" />
                <View className="px-4">
                  {data.services.map((s) => (
                    <ServiceRow key={s.name} service={s} />
                  ))}
                </View>
              </Card>
            )}
          </>
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
