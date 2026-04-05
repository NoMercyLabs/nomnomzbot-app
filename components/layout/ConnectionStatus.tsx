import { View, Text } from 'react-native'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import { cn } from '@/lib/utils/cn'

export function ConnectionStatus() {
  const { isConnected, isReconnecting } = useConnectionStatus()

  if (isConnected) return null

  return (
    <View className={cn(
      'flex-row items-center gap-2 px-4 py-2',
      isReconnecting ? 'bg-yellow-500/20' : 'bg-red-500/20',
    )}>
      <View className={cn('h-2 w-2 rounded-full', isReconnecting ? 'bg-yellow-400' : 'bg-red-400')} />
      <Text className={cn('text-xs', isReconnecting ? 'text-yellow-400' : 'text-red-400')}>
        {isReconnecting ? 'Reconnecting...' : 'Disconnected'}
      </Text>
    </View>
  )
}
