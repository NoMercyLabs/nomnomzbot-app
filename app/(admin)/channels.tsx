import { useState } from 'react'
import { View, Text, ScrollView, RefreshControl, TextInput } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Radio, Search, Ban, Check } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'

interface AdminChannel {
  id: string
  broadcasterId: string
  login: string
  displayName: string
  isLive: boolean
  viewerCount?: number
  botEnabled: boolean
  isSuspended: boolean
  createdAt: string
  plan: 'free' | 'pro' | 'enterprise'
}

export default function AdminChannelsScreen() {
  const [search, setSearch] = useState('')
  const toast = useToast()
  const qc = useQueryClient()

  const { data: channels = [], isLoading, refetch, isRefetching } = useQuery<AdminChannel[]>({
    queryKey: ['admin', 'channels'],
    queryFn: () => apiClient.get('/api/admin/channels').then((r) => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'suspend' | 'unsuspend' | 'enable-bot' | 'disable-bot' }) =>
      apiClient.post(`/api/admin/channels/${id}/${action}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'channels'] }),
    onError: () => toast.error('Action failed'),
  })

  const filtered = search.trim()
    ? channels.filter((c) =>
        c.login.toLowerCase().includes(search.toLowerCase()) ||
        c.displayName.toLowerCase().includes(search.toLowerCase()),
      )
    : channels

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="Channels" showBack subtitle={`${channels.length} total`} />

      <View className="px-4 pb-2">
        <View className="flex-row items-center gap-2 rounded-xl bg-surface-overlay border border-border px-3 py-2">
          <Search size={16} color="#5a5b72" />
          <TextInput
            placeholder="Search channels..."
            placeholderTextColor="#5a5b72"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-sm text-gray-200"
            autoCapitalize="none"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState title="No channels found" message="Try a different search." />
        ) : (
          filtered.map((channel) => (
            <Card key={channel.id} className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 rounded-full bg-surface-overlay items-center justify-center">
                  <Radio size={18} color={channel.isLive ? '#ef4444' : '#5a5b72'} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-gray-100">{channel.displayName}</Text>
                  <Text className="text-xs text-gray-500">@{channel.login}</Text>
                </View>
                <View className="gap-1 items-end">
                  {channel.isLive && <Badge variant="danger" label="LIVE" />}
                  <Badge
                    variant={
                      channel.plan === 'enterprise' ? 'warning' :
                      channel.plan === 'pro' ? 'info' : 'muted'
                    }
                    label={channel.plan.charAt(0).toUpperCase() + channel.plan.slice(1)}
                  />
                </View>
              </View>
              <View className="flex-row gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    toggleMutation.mutate({
                      id: channel.id,
                      action: channel.isSuspended ? 'unsuspend' : 'suspend',
                    })
                  }
                  leftIcon={<Ban size={12} color={channel.isSuspended ? '#10b981' : '#ef4444'} />}
                  label={channel.isSuspended ? 'Unsuspend' : 'Suspend'}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    toggleMutation.mutate({
                      id: channel.id,
                      action: channel.botEnabled ? 'disable-bot' : 'enable-bot',
                    })
                  }
                  leftIcon={<Check size={12} color={channel.botEnabled ? '#ef4444' : '#10b981'} />}
                  label={channel.botEnabled ? 'Disable Bot' : 'Enable Bot'}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  )
}
