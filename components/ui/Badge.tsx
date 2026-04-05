import { View, Text } from 'react-native'
import { cn } from '@/lib/utils/cn'

export type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'secondary' | 'muted'

export interface BadgeProps {
  label?: string
  children?: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-accent-900', text: 'text-accent-300' },
  info: { container: 'bg-accent-900', text: 'text-accent-300' },
  success: { container: 'bg-green-900', text: 'text-green-300' },
  warning: { container: 'bg-amber-900', text: 'text-amber-300' },
  danger: { container: 'bg-red-900', text: 'text-red-300' },
  secondary: { container: 'bg-surface-overlay', text: 'text-gray-400' },
  muted: { container: 'bg-surface-overlay', text: 'text-gray-500' },
}

export function Badge({ label, children, variant = 'default', className }: BadgeProps) {
  const styles = variantStyles[variant]
  const content = label ?? children
  return (
    <View className={cn('rounded-md px-2 py-0.5', styles.container, className)}>
      <Text className={cn('text-xs font-medium', styles.text)}>{content}</Text>
    </View>
  )
}
