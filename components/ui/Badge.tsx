import { View, Text } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva('flex-row items-center rounded-full px-2.5 py-0.5 gap-1', {
  variants: {
    variant: {
      default: 'bg-accent-500/20',
      success: 'bg-green-500/20',
      warning: 'bg-yellow-500/20',
      danger: 'bg-red-500/20',
      info: 'bg-blue-500/20',
      muted: 'bg-gray-700',
    },
  },
  defaultVariants: { variant: 'default' },
})

const badgeTextVariants = cva('text-xs font-medium', {
  variants: {
    variant: {
      default: 'text-accent-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      danger: 'text-red-400',
      info: 'text-blue-400',
      muted: 'text-gray-400',
    },
  },
  defaultVariants: { variant: 'default' },
})

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: string
  className?: string
  dot?: boolean
}

export function Badge({ children, variant, className, dot }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      {dot && (
        <View className={cn(
          'h-1.5 w-1.5 rounded-full',
          variant === 'success' ? 'bg-green-400' :
          variant === 'warning' ? 'bg-yellow-400' :
          variant === 'danger' ? 'bg-red-400' :
          'bg-accent-400'
        )} />
      )}
      <Text className={badgeTextVariants({ variant })}>{children}</Text>
    </View>
  )
}
