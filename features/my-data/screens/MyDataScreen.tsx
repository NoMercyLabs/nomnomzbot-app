import { View, Text, ScrollView, Alert, RefreshControl, Platform } from 'react-native'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  MessageSquare,
  Clock,
  Hash,
  Terminal,
  Download,
  Trash2,
} from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

interface MyData {
  messageCount: number
  watchHours: number
  channelsCount: number
  commandsUsed: number
  firstSeen: string | null
  lastActive: string | null
  exportAvailable: boolean
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 bg-surface-raised rounded-xl p-4 items-center gap-2 min-w-[40%]">
      <View className="opacity-70">{icon}</View>
      <Text className="text-xl font-bold text-gray-100">{value}</Text>
      <Text className="text-xs text-gray-500 text-center">{label}</Text>
    </View>
  )
}

export function MyDataScreen() {
  const { user } = useAuth()

  const { data, isLoading, isRefetching, refetch } = useQuery<MyData>({
    queryKey: ['me', 'data'],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await apiClient.get<{ data: MyData }>(`/v1/users/${user!.id}/stats`)
      return res.data.data
    },
  })

  const exportMutation = useMutation<void, Error>({
    mutationFn: async () => {
      if (Platform.OS === 'web') {
        const res = await apiClient.get(`/v1/users/${user!.id}/data-export`, {
          responseType: 'blob',
        })
        const url = URL.createObjectURL(res.data as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'user-data-export.json'
        a.click()
        URL.revokeObjectURL(url)
      } else {
        throw new Error('Please use the web app to download your data export.')
      }
    },
    onSuccess: () => {
      Alert.alert('Export Started', 'Your data is downloading.')
    },
    onError: (e) => {
      Alert.alert('Export', e.message || 'Export failed.')
    },
  })

  const deleteMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await apiClient.delete(`/v1/users/${user!.id}/data`)
    },
    onSuccess: () => {
      Alert.alert('Data Deleted', 'Your data has been deleted from our systems.')
    },
    onError: () => {
      Alert.alert('Delete Failed', 'Could not delete your data. Please try again.')
    },
  })

  function handleDeleteRequest() {
    Alert.alert(
      'Delete My Data',
      'This will permanently delete all your data including message history, watch time, and preferences. This action cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ],
    )
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8" refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
      <PageHeader
        title="My Data"
        subtitle="GDPR data management"
      />

      <View className="px-4 pt-4 gap-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" count={3} />
        ) : (
          <>
            {/* Stats grid */}
            <Card>
              <CardHeader title="Your Activity" />
              <View className="p-4 flex-row flex-wrap gap-3">
                <StatCard
                  icon={<MessageSquare size={20} color="rgb(139,92,246)" />}
                  label="Messages Sent"
                  value={(data?.messageCount ?? 0).toLocaleString()}
                />
                <StatCard
                  icon={<Clock size={20} color="rgb(59,130,246)" />}
                  label="Watch Hours"
                  value={(data?.watchHours ?? 0).toLocaleString()}
                />
                <StatCard
                  icon={<Hash size={20} color="rgb(16,185,129)" />}
                  label="Channels"
                  value={(data?.channelsCount ?? 0).toString()}
                />
                <StatCard
                  icon={<Terminal size={20} color="rgb(245,158,11)" />}
                  label="Commands Used"
                  value={(data?.commandsUsed ?? 0).toLocaleString()}
                />
              </View>
            </Card>

            {/* Account Info */}
            {(data?.firstSeen || data?.lastActive) && (
              <Card>
                <CardHeader title="Account Timeline" />
                <View className="px-4 py-3 gap-2">
                  {data.firstSeen && (
                    <View className="flex-row justify-between items-center py-1">
                      <Text className="text-sm text-gray-400">First seen</Text>
                      <Text className="text-sm text-gray-100">{formatDate(data.firstSeen)}</Text>
                    </View>
                  )}
                  {data.lastActive && (
                    <View className="flex-row justify-between items-center py-1">
                      <Text className="text-sm text-gray-400">Last active</Text>
                      <Text className="text-sm text-gray-100">{formatDate(data.lastActive)}</Text>
                    </View>
                  )}
                </View>
              </Card>
            )}

            {/* Export */}
            <Card>
              <CardHeader title="Export My Data" />
              <View className="px-4 py-4 gap-3">
                <Text className="text-sm text-gray-400">
                  Download a copy of all your data, including message history, watch time, and
                  account information.
                </Text>
                <Button
                  label="Request Data Export"
                  variant="secondary"
                  leftIcon={<Download size={16} color="rgb(209,213,219)" />}
                  loading={exportMutation.isPending}
                  onPress={() => exportMutation.mutate()}
                />
              </View>
            </Card>

            {/* Delete */}
            <Card className="border border-red-900">
              <CardHeader title="Danger Zone" />
              <View className="px-4 py-4 gap-3">
                <Text className="text-sm text-gray-400">
                  Permanently delete all your data from our systems. This includes messages, watch
                  history, and preferences. This action is irreversible.
                </Text>
                <Button
                  label="Delete My Data"
                  variant="danger"
                  leftIcon={<Trash2 size={16} color="white" />}
                  loading={deleteMutation.isPending}
                  onPress={handleDeleteRequest}
                />
              </View>
            </Card>
          </>
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
