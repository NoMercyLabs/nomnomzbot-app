import { useState } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'
import type { Permission } from '@/types/auth'

interface PermissionRule {
  id: string
  subjectType: 'user' | 'role'
  subjectId: string
  subjectLabel: string
  permission: Permission
  granted: boolean
}

const PERMISSIONS_GROUPED: { group: string; items: { key: Permission; label: string; description: string }[] }[] = [
  {
    group: 'Commands',
    items: [
      { key: 'commands.view', label: 'View Commands', description: 'See the commands list' },
      { key: 'commands.edit', label: 'Edit Commands', description: 'Create and modify commands' },
      { key: 'commands.delete', label: 'Delete Commands', description: 'Remove commands' },
    ],
  },
  {
    group: 'Moderation',
    items: [
      { key: 'moderation.ban', label: 'Ban Users', description: 'Permanently ban viewers' },
      { key: 'moderation.timeout', label: 'Timeout Users', description: 'Temporarily mute viewers' },
      { key: 'chat.send', label: 'Send Chat', description: 'Send messages as the bot' },
    ],
  },
  {
    group: 'Content',
    items: [
      { key: 'music.control', label: 'Control Music', description: 'Skip, pause, manage queue' },
      { key: 'rewards.edit', label: 'Edit Rewards', description: 'Create and modify channel points rewards' },
      { key: 'stream.update', label: 'Update Stream', description: 'Change title and category' },
    ],
  },
  {
    group: 'Management',
    items: [
      { key: 'settings.manage', label: 'Manage Settings', description: 'Change bot configuration' },
      { key: 'pipelines.edit', label: 'Edit Pipelines', description: 'Create and modify automation pipelines' },
      { key: 'widgets.edit', label: 'Edit Widgets', description: 'Create and modify overlay widgets' },
      { key: 'admin', label: 'Admin Access', description: 'Full admin rights' },
    ],
  },
]

const ROLE_OPTIONS = [
  { label: 'Viewer', value: 'viewer' },
  { label: 'Subscriber', value: 'subscriber' },
  { label: 'VIP', value: 'vip' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Broadcaster', value: 'broadcaster' },
]

function PermissionGroupCard({
  group,
  items,
  rules,
  onToggle,
}: {
  group: string
  items: { key: Permission; label: string; description: string }[]
  rules: PermissionRule[]
  onToggle: (permission: Permission, role: string, granted: boolean) => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Card className="gap-3">
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setExpanded((p) => !p)}
        rightIcon={expanded ? <ChevronDown size={14} color="#8889a0" /> : <ChevronRight size={14} color="#8889a0" />}
        label={group}
        className="justify-between px-0"
      />
      {expanded && items.map((item) => {
        const matchingRules = rules.filter((r) => r.permission === item.key)
        return (
          <View key={item.key} className="gap-2 border-t border-border pt-3">
            <View className="gap-0.5">
              <Text className="text-sm font-medium text-gray-200">{item.label}</Text>
              <Text className="text-xs text-gray-500">{item.description}</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const rule = matchingRules.find((r) => r.subjectId === role.value)
                const granted = rule?.granted ?? false
                return (
                  <View key={role.value} className="flex-row items-center gap-1.5">
                    <Toggle
                      value={granted}
                      onValueChange={(v) => onToggle(item.key, role.value, v)}
                    />
                    <Text className="text-xs text-gray-400">{role.label}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
    </Card>
  )
}

export default function PermissionsScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: rules = [], isLoading, refetch, isRefetching } = useQuery<PermissionRule[]>({
    queryKey: ['permissions', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/permissions`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const toggleMutation = useMutation({
    mutationFn: ({
      permission,
      subjectId,
      granted,
    }: { permission: Permission; subjectId: string; granted: boolean }) =>
      apiClient.put(`/api/${broadcasterId}/permissions`, {
        subjectType: 'role',
        subjectId,
        permission,
        granted,
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions', broadcasterId] }),
    onError: () => toast.error('Failed to update permission'),
  })

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader title="Permissions" subtitle="Control access by role" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </View>
        ) : (
          PERMISSIONS_GROUPED.map(({ group, items }) => (
            <PermissionGroupCard
              key={group}
              group={group}
              items={items}
              rules={rules}
              onToggle={(permission, subjectId, granted) =>
                toggleMutation.mutate({ permission, subjectId, granted })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}
