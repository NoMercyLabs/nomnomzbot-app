import { View, Text } from 'react-native'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const alertVariants = cva('rounded-lg border p-4 gap-1', {
  variants: {
    variant: {
      info: 'bg-blue-500/10 border-blue-500/30',
      success: 'bg-green-500/10 border-green-500/30',
      warning: 'bg-yellow-500/10 border-yellow-500/30',
      error: 'bg-red-500/10 border-red-500/30',
    },
  },
  defaultVariants: { variant: 'info' },
})

const titleVariants = cva('text-sm font-semibold', {
  variants: {
    variant: {
      info: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
    },
  },
  defaultVariants: { variant: 'info' },
})

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children?: React.ReactNode
  className?: string
}

export function Alert({ variant, title, children, className }: AlertProps) {
  return (
    <View className={cn(alertVariants({ variant }), className)}>
      {title && <Text className={titleVariants({ variant })}>{title}</Text>}
      {children && <Text className="text-sm text-gray-300">{String(children)}</Text>}
    </View>
  )
}
