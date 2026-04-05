import { useState } from 'react'
import { View, Text, ScrollView, RefreshControl, TextInput, Alert } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, Shield, Ban } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'

interface AdminUser {
  id: string
  twitchId: string
  login: string
  displayName: string
  email?: string
  isAdmin: boolean
  isBanned: boolean
  createdAt: string
  channelCount: number
}

export default function AdminUsersScreen() {
  const [search, setSearch] = useState('')
  const toast = useToast()
  const qc = useQueryClient()

  const { data: users = [], isLoading, refetch, isRefetching } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => apiClient.get('/api/admin/users').then((r) => r.data),
  })

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ban' | 'unban' | 'make-admin' | 'remove-admin' }) =>
      apiClient.post(`/api/admin/users/${id}/${action}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    onError: () => toast.error('Action failed'),
  })

  const filtered = search.trim()
    ? users.filter((u) =>
        u.login.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : users

  function confirmBan(user: AdminUser) {
    Alert.alert(
      user.isBanned ? 'Unban User' : 'Ban User',
      `${user.isBanned ? 'Unban' : 'Ban'} ${user.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: user.isBanned ? 'Unban' : 'Ban',
          style: user.isBanned ? 'default' : 'destructive',
          onPress: () => actionMutation.mutate({ id: user.id, action: user.isBanned ? 'unban' : 'ban' }),
        },
      ],
    )
  }

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="Users" showBack subtitle={`${users.length} total`} />

      <View className="px-4 pb-2">
        <View className="flex-row items-center gap-2 rounded-xl bg-surface-overlay border border-border px-3 py-2">
          <Search size={16} color="#5a5b72" />
          <TextInput
            placeholder="Search users..."
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
          <EmptyState title="No users found" message="Try a different search." />
        ) : (
          filtered.map((user) => (
            <Card key={user.id} className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 rounded-full bg-surface-overlay items-center justify-center">
                  <Users size={18} color="#8889a0" />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-gray-100">{user.displayName}</Text>
                  <Text className="text-xs text-gray-500">@{user.login}</Text>
                  {user.email && <Text className="text-xs text-gray-600">{user.email}</Text>}
                </View>
                <View className="gap-1 items-end">
                  {user.isAdmin && <Badge variant="warning" label="Admin" />}
                  {user.isBanned && <Badge variant="danger" label="Banned" />}
                  <Text className="text-xs text-gray-600">{user.channelCount} ch</Text>
                </View>
              </View>
              <View className="flex-row gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    actionMutation.mutate({
                      id: user.id,
                      action: user.isAdmin ? 'remove-admin' : 'make-admin',
                    })
                  }
                  leftIcon={<Shield size={12} color={user.isAdmin ? '#ef4444' : '#f59e0b'} />}
                  label={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => confirmBan(user)}
                  leftIcon={<Ban size={12} color={user.isBanned ? '#10b981' : '#ef4444'} />}
                  label={user.isBanned ? 'Unban' : 'Ban'}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  )
}
