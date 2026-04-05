import { Pressable, Text, ActivityIndicator, View, type PressableProps } from 'react-native'
import { cn } from '@/lib/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  label?: string
  children?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent-600 active:bg-accent-700',
  secondary: 'bg-surface-overlay border border-border active:bg-surface-raised',
  danger: 'bg-red-700 active:bg-red-800',
  ghost: 'active:bg-surface-overlay',
  outline: 'border border-gray-600 active:bg-surface-overlay',
}

const textStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-gray-200',
  danger: 'text-white',
  ghost: 'text-gray-300',
  outline: 'text-gray-200',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
}

const textSizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  label,
  children,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const displayLabel = label ?? (typeof children === 'string' ? children : undefined)

  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center rounded-xl gap-2',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color="white" />}
      {leftIcon && <View>{leftIcon}</View>}
      {displayLabel && (
        <Text className={cn('font-semibold', textStyles[variant], textSizeStyles[size])}>
          {displayLabel}
        </Text>
      )}
      {!displayLabel && children && typeof children !== 'string' && children}
      {rightIcon && <View>{rightIcon}</View>}
    </Pressable>
  )
}
