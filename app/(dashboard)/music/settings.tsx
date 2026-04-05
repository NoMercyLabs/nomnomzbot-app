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

interface MusicSettings {
  allowRequests: boolean
  subscribersOnly: boolean
  maxQueueLength: number
  maxRequestsPerUser: number
  minFollowAgeDays: number
  allowExplicit: boolean
  blockedWords: string
  provider: 'spotify' | 'youtube'
  commandPrefix: string
  autoPlay: boolean
  volume: number
}

const DEFAULT: MusicSettings = {
  allowRequests: true,
  subscribersOnly: false,
  maxQueueLength: 50,
  maxRequestsPerUser: 3,
  minFollowAgeDays: 0,
  allowExplicit: true,
  blockedWords: '',
  provider: 'spotify',
  commandPrefix: '!sr',
  autoPlay: true,
  volume: 80,
}

export default function MusicSettingsScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: settings = DEFAULT, isLoading } = useQuery<MusicSettings>({
    queryKey: ['music', 'settings', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/music/settings`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const mutation = useMutation({
    mutationFn: (patch: Partial<MusicSettings>) =>
      apiClient.patch(`/api/${broadcasterId}/music/settings`, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['music', 'settings', broadcasterId] })
      toast.success('Saved')
    },
    onError: () => toast.error('Failed to save'),
  })

  function patch(key: keyof MusicSettings, value: unknown) {
    mutation.mutate({ [key]: value } as Partial<MusicSettings>)
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950">
        <PageHeader title="Music Settings" showBack />
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
      <PageHeader title="Music Settings" showBack />

      <Card className="gap-4">
        <Text className="text-sm font-semibold text-gray-300">Song Requests</Text>
        <Toggle
          label="Allow Requests"
          description="Viewers can add songs to the queue"
          value={settings.allowRequests}
          onValueChange={(v) => patch('allowRequests', v)}
        />
        <Input
          label="Request Command"
          value={settings.commandPrefix}
          onChangeText={(v) => patch('commandPrefix', v)}
          placeholder="!sr"
          autoCapitalize="none"
        />
        <Toggle
          label="Subscribers Only"
          description="Restrict requests to subscribers"
          value={settings.subscribersOnly}
          onValueChange={(v) => patch('subscribersOnly', v)}
        />
        <Input
          label="Minimum Follow Age (days)"
          value={String(settings.minFollowAgeDays)}
          onChangeText={(v) => patch('minFollowAgeDays', parseInt(v, 10) || 0)}
          keyboardType="numeric"
        />
      </Card>

      <Card className="gap-4">
        <Text className="text-sm font-semibold text-gray-300">Queue Limits</Text>
        <Input
          label="Max Queue Length"
          value={String(settings.maxQueueLength)}
          onChangeText={(v) => patch('maxQueueLength', parseInt(v, 10) || 50)}
          keyboardType="numeric"
        />
        <Input
          label="Max Requests per User"
          value={String(settings.maxRequestsPerUser)}
          onChangeText={(v) => patch('maxRequestsPerUser', parseInt(v, 10) || 3)}
          keyboardType="numeric"
        />
      </Card>

      <Card className="gap-4">
        <Text className="text-sm font-semibold text-gray-300">Content</Text>
        <Toggle
          label="Allow Explicit Tracks"
          description="Allow songs marked as explicit"
          value={settings.allowExplicit}
          onValueChange={(v) => patch('allowExplicit', v)}
        />
        <Input
          label="Blocked words (comma-separated)"
          value={settings.blockedWords}
          onChangeText={(v) => patch('blockedWords', v)}
          placeholder="word1, word2..."
          multiline
          numberOfLines={2}
        />
      </Card>

      <Card className="gap-4">
        <Text className="text-sm font-semibold text-gray-300">Playback</Text>
        <Toggle
          label="Auto Play"
          description="Start playing when a song is added"
          value={settings.autoPlay}
          onValueChange={(v) => patch('autoPlay', v)}
        />
        <Input
          label="Volume (0–100)"
          value={String(settings.volume)}
          onChangeText={(v) => patch('volume', parseInt(v, 10) || 80)}
          keyboardType="numeric"
        />
        <Select
          label="Default Provider"
          value={settings.provider}
          onValueChange={(v) => patch('provider', v)}
          options={[
            { label: 'Spotify', value: 'spotify' },
            { label: 'YouTube Music', value: 'youtube' },
          ]}
        />
      </Card>
    </ScrollView>
  )
}
