import { ScrollView, View, Text } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApiQuery } from '@/hooks/useApi'
import { Card } from '@/components/ui/Card'
import { Music, SkipForward } from 'lucide-react-native'

interface NowPlaying {
  title: string
  artist: string
  coverUrl?: string
}

export default function MusicScreen() {
  const { data: nowPlaying } = useApiQuery<NowPlaying | null>('now-playing', '/music/now-playing')

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Music" />
      <View className="px-6 py-4 gap-4">
        <Card className="p-6 items-center gap-3">
          <Music size={40} color="rgb(124,58,237)" />
          {nowPlaying ? (
            <>
              <Text className="text-gray-100 font-semibold text-lg text-center">{nowPlaying.title}</Text>
              <Text className="text-gray-400 text-sm">{nowPlaying.artist}</Text>
            </>
          ) : (
            <Text className="text-gray-500">Nothing playing</Text>
          )}
        </Card>
      </View>
    </ScrollView>
  )
}
