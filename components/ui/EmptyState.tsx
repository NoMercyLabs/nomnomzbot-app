import { View, Text } from 'react-native'
import { Button } from './Button'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: { label: string; onPress: () => void }
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center gap-3 px-6 py-12', className)}>
      {icon && <View className="mb-2 opacity-40">{icon}</View>}
      <Text className="text-center text-lg font-semibold text-white">{title}</Text>
      {description && (
        <Text className="text-center text-sm text-gray-500">{description}</Text>
      )}
      {action && (
        <Button onPress={action.onPress} className="mt-2">{action.label}</Button>
      )}
    </View>
  )
}
