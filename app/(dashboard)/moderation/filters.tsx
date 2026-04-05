import { View, Text, ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'

interface AutoModConfig {
  blockLinks: boolean
  blockCaps: boolean
  capsThreshold: number
  blockEmoteSpam: boolean
  maxEmotes: number
  blockSymbols: boolean
  symbolsThreshold: number
  blockRepetition: boolean
  blockBannedWords: boolean
  bannedWords: string
  slowMode: boolean
  slowModeSeconds: number
  subOnlyMode: boolean
  emoteOnlyMode: boolean
  followersOnly: boolean
  followersOnlyMinutes: number
}

const DEFAULT_CONFIG: AutoModConfig = {
  blockLinks: false,
  blockCaps: false,
  capsThreshold: 70,
  blockEmoteSpam: false,
  maxEmotes: 10,
  blockSymbols: false,
  symbolsThreshold: 50,
  blockRepetition: false,
  blockBannedWords: false,
  bannedWords: '',
  slowMode: false,
  slowModeSeconds: 3,
  subOnlyMode: false,
  emoteOnlyMode: false,
  followersOnly: false,
  followersOnlyMinutes: 0,
}

export default function FiltersScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: config = DEFAULT_CONFIG, isLoading } = useQuery<AutoModConfig>({
    queryKey: ['moderation', 'filters', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/moderation/filters`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const patchMutation = useMutation({
    mutationFn: (patch: Partial<AutoModConfig>) =>
      apiClient.patch(`/api/${broadcasterId}/moderation/filters`, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moderation', 'filters', broadcasterId] })
      toast.success('Saved')
    },
    onError: () => toast.error('Failed to save'),
  })

  function patch(key: keyof AutoModConfig, value: unknown) {
    patchMutation.mutate({ [key]: value } as Partial<AutoModConfig>)
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950">
        <PageHeader title="Auto-mod Filters" showBack />
        <View className="p-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </View>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="Auto-mod Filters" showBack />

      {/* Chat modes */}
      <Card className="gap-4">
        <Text className="text-sm font-semibold text-gray-300">Chat Modes</Text>
        <Toggle
          label="Slow Mode"
          description="Limit how often users can chat"
          value={config.slowMode}
          onValueChange={(v) => patch('slowMode', v)}
        />
        {config.slowMode && (
          <Input
            label="Cooldown (seconds)"
            value={String(config.slowModeSeconds)}
            onChangeText={(v) => patch('slowModeSeconds', parseInt(v, 10) || 3)}
            keyboardType="numeric"
          />
        )}
        <Toggle
          label="Subscribers Only"
          description="Only subscribers can chat"
          value={config.subOnlyMode}
          onValueChange={(v) => patch('subOnlyMode', v)}
        />
        <Toggle
          label="Emote Only"
          description="Only emotes are allowed in chat"
          value={config.emoteOnlyMode}
          onValueChange={(v) => patch('emoteOnlyMode', v)}
        />
        <Toggle
          label="Followers Only"
          description="Only followers can chat"
          value={config.followersOnly}
          onValueChange={(v) => patch('followersOnly', v)}
        />
        {config.followersOnly && (
          <Input
            label="Minimum follow time (minutes)"
            value={String(config.followersOnlyMinutes)}
            onChangeText={(v) => patch('followersOnlyMinutes', parseInt(v, 10) || 0)}
            keyboardType="numeric"
          />
        )}
      </Card>

      {/* Content filters */}
      <Card className="gap-4">
        <Text className="text-sm font-semibold text-gray-300">Content Filters</Text>
        <Toggle
          label="Block Links"
          description="Remove messages containing URLs"
          value={config.blockLinks}
          onValueChange={(v) => patch('blockLinks', v)}
        />
        <Toggle
          label="Block Excessive Caps"
          description="Remove messages with too many capital letters"
          value={config.blockCaps}
          onValueChange={(v) => patch('blockCaps', v)}
        />
        {config.blockCaps && (
          <Input
            label="Caps threshold (%)"
            value={String(config.capsThreshold)}
            onChangeText={(v) => patch('capsThreshold', parseInt(v, 10) || 70)}
            keyboardType="numeric"
          />
        )}
        <Toggle
          label="Block Emote Spam"
          description="Limit the number of emotes per message"
          value={config.blockEmoteSpam}
          onValueChange={(v) => patch('blockEmoteSpam', v)}
        />
        {config.blockEmoteSpam && (
          <Input
            label="Max emotes per message"
            value={String(config.maxEmotes)}
            onChangeText={(v) => patch('maxEmotes', parseInt(v, 10) || 10)}
            keyboardType="numeric"
          />
        )}
        <Toggle
          label="Block Symbol Spam"
          description="Remove messages with excessive symbols"
          value={config.blockSymbols}
          onValueChange={(v) => patch('blockSymbols', v)}
        />
        <Toggle
          label="Block Repetition"
          description="Remove repetitive or copied messages"
          value={config.blockRepetition}
          onValueChange={(v) => patch('blockRepetition', v)}
        />
      </Card>

      {/* Banned words */}
      <Card className="gap-3">
        <Toggle
          label="Banned Words"
          description="Block messages containing specific words"
          value={config.blockBannedWords}
          onValueChange={(v) => patch('blockBannedWords', v)}
        />
        {config.blockBannedWords && (
          <Input
            label="Banned words (comma-separated)"
            placeholder="word1, word2, phrase..."
            value={config.bannedWords}
            onChangeText={(v) => patch('bannedWords', v)}
            multiline
            numberOfLines={3}
          />
        )}
      </Card>
    </ScrollView>
  )
}
