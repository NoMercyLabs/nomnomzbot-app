import { View, Text, ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'
import type { ChatSettings } from '@/features/chat/types'

const DEFAULT: ChatSettings = {
  slowMode: false,
  slowModeDelay: 3,
  subscriberOnly: false,
  emotesOnly: false,
  followersOnly: false,
  followersOnlyDuration: 0,
}

export default function ChatSettingsScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: settings = DEFAULT, isLoading } = useQuery<ChatSettings>({
    queryKey: ['chat', 'settings', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/chat/settings`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const mutation = useMutation({
    mutationFn: (patch: Partial<ChatSettings>) =>
      apiClient.patch(`/api/${broadcasterId}/chat/settings`, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'settings', broadcasterId] })
      toast.success('Saved')
    },
    onError: () => toast.error('Failed to save'),
  })

  function patch(key: keyof ChatSettings, value: unknown) {
    mutation.mutate({ [key]: value } as Partial<ChatSettings>)
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950">
        <PageHeader title="Chat Settings" showBack />
        <View className="p-4 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </View>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="Chat Settings" showBack />

      <Card className="gap-4">
        <Text className="text-sm font-semibold text-gray-300">Chat Modes</Text>

        <Toggle
          label="Slow Mode"
          description="Limit how often any user can send messages"
          value={settings.slowMode}
          onValueChange={(v) => patch('slowMode', v)}
        />
        {settings.slowMode && (
          <Input
            label="Delay (seconds)"
            value={String(settings.slowModeDelay)}
            onChangeText={(v) => patch('slowModeDelay', parseInt(v, 10) || 3)}
            keyboardType="numeric"
          />
        )}

        <Toggle
          label="Subscriber Only"
          description="Only subscribers can send messages"
          value={settings.subscriberOnly}
          onValueChange={(v) => patch('subscriberOnly', v)}
        />

        <Toggle
          label="Emote Only"
          description="Only emotes are allowed in chat"
          value={settings.emotesOnly}
          onValueChange={(v) => patch('emotesOnly', v)}
        />

        <Toggle
          label="Followers Only"
          description="Only followers can send messages"
          value={settings.followersOnly}
          onValueChange={(v) => patch('followersOnly', v)}
        />
        {settings.followersOnly && (
          <Input
            label="Minimum follow time (minutes)"
            value={String(settings.followersOnlyDuration)}
            onChangeText={(v) => patch('followersOnlyDuration', parseInt(v, 10) || 0)}
            keyboardType="numeric"
          />
        )}
      </Card>
    </ScrollView>
  )
}
