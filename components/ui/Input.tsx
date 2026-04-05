import { View, Text, TextInput, type TextInputProps } from 'react-native'
import { cn } from '@/lib/utils/cn'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  inputClassName?: string
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerClassName,
  inputClassName,
  ...props
}: InputProps) {
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-gray-300">{label}</Text>
      )}
      <View className={cn(
        'flex-row items-center rounded-lg border bg-gray-800 px-3',
        error ? 'border-red-500' : 'border-gray-700',
        props.editable === false && 'opacity-60',
      )}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={cn('flex-1 py-2.5 text-sm text-white', inputClassName)}
          placeholderTextColor="#6b7280"
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-xs text-red-400">{error}</Text>}
      {hint && !error && <Text className="text-xs text-gray-500">{hint}</Text>}
    </View>
  )
}
