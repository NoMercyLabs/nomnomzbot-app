import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 rounded-lg',
  {
    variants: {
      variant: {
        default: 'bg-accent-500 active:bg-accent-600',
        destructive: 'bg-red-600 active:bg-red-700',
        outline: 'border border-gray-600 bg-transparent active:bg-gray-800',
        ghost: 'bg-transparent active:bg-gray-800',
        secondary: 'bg-gray-700 active:bg-gray-600',
      },
      size: {
        sm: 'px-3 py-1.5',
        md: 'px-4 py-2.5',
        lg: 'px-6 py-3.5',
        icon: 'p-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

const textVariants = cva('font-semibold', {
  variants: {
    variant: {
      default: 'text-white',
      destructive: 'text-white',
      outline: 'text-gray-200',
      ghost: 'text-gray-200',
      secondary: 'text-gray-100',
    },
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      icon: 'text-sm',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  textClassName?: string
}

export function Button({
  children,
  variant,
  size,
  isLoading,
  leftIcon,
  rightIcon,
  className,
  textClassName,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), (disabled || isLoading) && 'opacity-50', className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          {leftIcon}
          {typeof children === 'string' ? (
            <Text className={cn(textVariants({ variant, size }), textClassName)}>{children}</Text>
          ) : children}
          {rightIcon}
        </>
      )}
    </Pressable>
  )
}
