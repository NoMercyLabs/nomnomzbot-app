import { View, Text, Pressable } from 'react-native'
import { useChannel } from '@/hooks/useChannel'
import { Avatar } from '@/components/ui/Avatar'
import { ChevronDown } from 'lucide-react-native'

export function ChannelSwitcher() {
  const { currentChannel } = useChannel()

  return (
    <Pressable className="flex-row items-center gap-2 rounded-lg px-3 py-1.5 active:bg-surface-overlay">
      <Avatar
        src={currentChannel?.profileImageUrl}
        name={currentChannel?.displayName}
        size="sm"
      />
      <Text className="text-gray-200 font-medium text-sm">
        {currentChannel?.displayName ?? 'Select channel'}
      </Text>
      {currentChannel?.isLive && (
        <View className="rounded bg-red-600 px-1.5 py-0.5">
          <Text className="text-white text-xs font-bold">LIVE</Text>
        </View>
      )}
      <ChevronDown size={14} color="rgb(156, 163, 175)" />
    </Pressable>
  )
}
