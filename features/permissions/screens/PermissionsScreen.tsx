import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ShieldCheck, ShieldAlert, Lock } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { ErrorState } from '@/components/ui/ErrorState'
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout'

interface Permission {
  scope: string
  name: string
  description: string
  category: string
  granted: boolean
  required: boolean
}

interface PermissionsResponse {
  permissions: Permission[]
  grantedCount: number
  totalCount: number
}

function PermissionRow({ permission, onGrant, isGranting }: {
  permission: Permission
  onGrant: (scope: string) => void
  isGranting: boolean
}) {
  return (
    <View
      className="flex-row items-start justify-between gap-3 py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
    >
      <View className="flex-row items-start gap-3 flex-1">
        <View className="mt-0.5">
          {permission.granted
            ? <ShieldCheck size={16} color="#4ade80" />
            : <ShieldAlert size={16} color="#fbbf24" />
          }
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-sm font-medium text-white">{permission.name}</Text>
            {permission.required && (
              <Badge variant="warning" label="Required" />
            )}
          </View>
          <Text className="text-xs" style={{ color: '#5a5280' }}>{permission.description}</Text>
          <Text className="text-xs font-mono mt-0.5" style={{ color: '#3d3566' }}>{permission.scope}</Text>
        </View>
      </View>
      {permission.granted ? (
        <Badge variant="success" label="Granted" />
      ) : (
        <Button
          size="sm"
          variant="outline"
          label="Grant"
          loading={isGranting}
          onPress={() => onGrant(permission.scope)}
        />
      )}
    </View>
  )
}

export function PermissionsScreen() {
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const requestScopeUpgrade = useAuthStore((s) => s.requestScopeUpgrade)
  const pendingScopeUpgrade = useAuthStore((s) => s.pendingScopeUpgrade)

  const { data, isLoading, isError, isRefetching, refetch } = useQuery<PermissionsResponse>({
    queryKey: ['permissions', channelId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PermissionsResponse }>(
        `/v1/channels/${channelId}/permissions`,
      )
      return res.data.data
    },
    enabled: !!channelId,
  })

  function handleGrant(scope: string) {
    requestScopeUpgrade([scope])
  }

  const timedOut = useLoadingTimeout(isLoading)
  const showSkeleton = isLoading && !isError && !timedOut

  const grouped = data?.permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {}) ?? {}

  const grantedCount = data?.grantedCount ?? 0
  const totalCount = data?.totalCount ?? 0

  return (
    <ErrorBoundary>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#141125' }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHeader
          title="Permissions"
          subtitle={!showSkeleton ? `${grantedCount} / ${totalCount} granted` : 'OAuth scope management'}
        />

        <View className="px-5 pt-4 gap-4">
          {isError || timedOut ? (
            <ErrorState title="Unable to load permissions" onRetry={refetch} />
          ) : showSkeleton ? (
            <View className="gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </View>
          ) : !data?.permissions.length ? (
            <EmptyState
              icon={<Lock size={40} color="#3d3566" />}
              title="No permissions found"
              message="Permission data could not be loaded."
            />
          ) : (
            <>
              {/* Summary card */}
              <View
                className="rounded-xl p-4 flex-row items-center gap-4"
                style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
              >
                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-semibold text-white">OAuth Scopes</Text>
                  <Text className="text-sm" style={{ color: '#8889a0' }}>
                    {grantedCount === totalCount
                      ? 'All permissions are granted'
                      : `${totalCount - grantedCount} permission${totalCount - grantedCount !== 1 ? 's' : ''} missing`}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">{grantedCount}</Text>
                  <Text className="text-xs" style={{ color: '#5a5280' }}>of {totalCount}</Text>
                </View>
              </View>

              {pendingScopeUpgrade && pendingScopeUpgrade.length > 0 && (
                <View
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: 'rgba(245,158,11,0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(245,158,11,0.4)',
                  }}
                >
                  <Text className="text-sm font-medium" style={{ color: '#fbbf24' }}>Scope upgrade pending</Text>
                  <Text className="text-xs mt-1" style={{ color: '#d97706' }}>
                    A re-authentication will be required to grant:{' '}
                    {pendingScopeUpgrade.join(', ')}
                  </Text>
                </View>
              )}

              {Object.entries(grouped).map(([category, perms]) => (
                <View
                  key={category}
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
                >
                  <View
                    className="px-4 py-3"
                    style={{ backgroundColor: '#231D42', borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
                  >
                    <Text className="text-sm font-semibold text-white">{category}</Text>
                  </View>
                  <View className="px-4">
                    {perms.map((p, i) => (
                      <View key={p.scope} style={i === perms.length - 1 ? { borderBottomWidth: 0 } : undefined}>
                        <PermissionRow
                          permission={p}
                          onGrant={handleGrant}
                          isGranting={pendingScopeUpgrade?.includes(p.scope) ?? false}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </ErrorBoundary>
  )
}
