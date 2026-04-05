import { View, Text } from 'react-native'
import { cn } from '@/lib/utils/cn'
import type { TrustLevel } from '../types'

interface TrustBadgeProps {
  level: TrustLevel
  className?: string
}

const levelStyles: Record<TrustLevel, { container: string; text: string; label: string }> = {
  viewer: {
    container: 'bg-gray-800',
    text: 'text-gray-400',
    label: 'Viewer',
  },
  regular: {
    container: 'bg-blue-900',
    text: 'text-blue-300',
    label: 'Regular',
  },
  vip: {
    container: 'bg-purple-900',
    text: 'text-purple-300',
    label: 'VIP',
  },
  moderator: {
    container: 'bg-green-900',
    text: 'text-green-300',
    label: 'Mod',
  },
  broadcaster: {
    container: 'bg-amber-900',
    text: 'text-amber-300',
    label: 'Broadcaster',
  },
}

export function TrustBadge({ level, className }: TrustBadgeProps) {
  const styles = levelStyles[level] ?? levelStyles.viewer

  return (
    <View className={cn('rounded-md px-2 py-0.5', styles.container, className)}>
      <Text className={cn('text-xs font-medium', styles.text)}>{styles.label}</Text>
    </View>
  )
}
