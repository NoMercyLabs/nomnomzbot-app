import { View, Text, type ViewProps } from 'react-native'
import { cn } from '@/lib/utils/cn'

interface CardProps extends ViewProps {
  className?: string
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-xl bg-surface-raised', className)}
      {...props}
    >
      {children}
    </View>
  )
}

interface CardHeaderProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, children, className }: CardHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between px-4 py-3 border-b border-border', className)}>
      <View className="flex-1">
        {title ? (
          <>
            <Text className="text-base font-semibold text-white">{title}</Text>
            {subtitle && <Text className="text-sm text-gray-400">{subtitle}</Text>}
          </>
        ) : (
          children
        )}
      </View>
      {action && <View>{action}</View>}
    </View>
  )
}
