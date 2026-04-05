import { useState, useEffect } from 'react'
import { ScrollView, View, Text, ActivityIndicator } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useChannelStore } from '@/stores/useChannelStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'
import { getMusicSettings, saveMusicSettings } from '@/features/music/api'
import type { MusicSettings } from '@/features/music/types'

export default function MusicSettingsScreen() {
  const channelId = useChannelStore((s) => s.currentChannel?.id ?? '')
  const qc = useQueryClient()

  const { data: settings, isLoading } = useQuery<MusicSettings>({
    queryKey: ['music', 'settings', channelId],
    queryFn: () => getMusicSettings(channelId),
    enabled: !!channelId,
  })

  const [requireSub, setRequireSub] = useState(false)
  const [allowVoteSkip, setAllowVoteSkip] = useState(false)
  const [maxQueue, setMaxQueue] = useState('50')
  const [maxPerUser, setMaxPerUser] = useState('3')

  useEffect(() => {
    if (settings) {
      setRequireSub(settings.requireSubToRequest)
      setAllowVoteSkip(settings.allowVoteSkip)
      setMaxQueue(String(settings.maxQueueSize))
      setMaxPerUser(String(settings.maxRequestsPerUser))
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: (data: Partial<MusicSettings>) => saveMusicSettings(channelId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['music', 'settings', channelId] })
    },
  })

  const handleSave = () => {
    const queueSize = Math.min(100, Math.max(1, parseInt(maxQueue, 10) || 50))
    const perUser = Math.min(10, Math.max(1, parseInt(maxPerUser, 10) || 3))
    saveMutation.mutate({
      requireSubToRequest: requireSub,
      allowVoteSkip,
      maxQueueSize: queueSize,
      maxRequestsPerUser: perUser,
    })
  }

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8">
      <PageHeader title="Music Settings" backHref="/(dashboard)/music" />

      <View className="px-4 gap-4">
        {/* Provider info */}
        <Card className="p-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Provider
          </Text>
          {isLoading ? (
            <View className="h-6 bg-gray-800 rounded w-32" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-gray-400">Music provider:</Text>
              <Text className="text-sm font-medium text-white capitalize">
                {settings?.provider ?? '—'}
              </Text>
            </View>
          )}
        </Card>

        {/* Request rules */}
        <Card className="p-4 gap-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Request Rules
          </Text>

          <Toggle
            label="Require sub to request"
            description="Only Twitch subscribers can request songs"
            value={requireSub}
            onValueChange={setRequireSub}
            disabled={isLoading}
          />

          <Toggle
            label="Allow vote skip"
            description="Chat can vote to skip the current song"
            value={allowVoteSkip}
            onValueChange={setAllowVoteSkip}
            disabled={isLoading}
          />
        </Card>

        {/* Limits */}
        <Card className="p-4 gap-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Limits
          </Text>

          <Input
            label="Max queue size (1–100)"
            value={maxQueue}
            onChangeText={setMaxQueue}
            keyboardType="number-pad"
            maxLength={3}
            editable={!isLoading}
          />

          <Input
            label="Max requests per user (1–10)"
            value={maxPerUser}
            onChangeText={setMaxPerUser}
            keyboardType="number-pad"
            maxLength={2}
            editable={!isLoading}
          />
        </Card>

        <Button
          label={saveMutation.isPending ? 'Saving…' : 'Save Settings'}
          onPress={handleSave}
          disabled={isLoading || saveMutation.isPending}
        />

        {saveMutation.isSuccess && (
          <Text className="text-center text-sm text-green-400">Settings saved</Text>
        )}
        {saveMutation.isError && (
          <Text className="text-center text-sm text-red-400">Failed to save settings</Text>
        )}
      </View>
    </ScrollView>
  )
}
