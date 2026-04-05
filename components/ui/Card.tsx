import { View, type ViewProps } from 'react-native'
import { cn } from '@/lib/utils/cn'

interface CardProps extends ViewProps {
  className?: string
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-xl border border-gray-800 bg-gray-900 p-4', className)}
      {...props}
    >
      {children}
    </View>
  )
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <View className={cn('mb-3 flex-row items-center justify-between', className)} {...props}>
      {children}
    </View>
  )
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <View className={cn('gap-2', className)} {...props}>
      {children}
    </View>
  )
}
