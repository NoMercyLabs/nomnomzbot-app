import { View, Text, ScrollView, Pressable } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const INTEGRATIONS = [
  { name: 'Twitch', status: 'connected', description: 'Your primary Twitch account' },
  { name: 'Spotify', status: 'disconnected', description: 'Music playback and song requests' },
  { name: 'Discord', status: 'disconnected', description: 'Discord server notifications' },
  { name: 'StreamElements', status: 'disconnected', description: 'StreamElements alerts' },
]

export function IntegrationsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="Integrations" />
      {INTEGRATIONS.map((integration) => (
        <Card key={integration.name} className="flex-row items-center justify-between">
          <View className="flex-1 gap-1">
            <Text className="text-sm font-medium text-white">{integration.name}</Text>
            <Text className="text-xs text-gray-500">{integration.description}</Text>
          </View>
          <Badge
            variant={integration.status === 'connected' ? 'success' : 'muted'}
            label={integration.status === 'connected' ? 'Connected' : 'Connect'}
          />
        </Card>
      ))}
    </ScrollView>
  )
}
