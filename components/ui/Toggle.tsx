import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface ToggleProps {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function Toggle({ value, onValueChange, disabled, size = 'md' }: ToggleProps) {
  const offset = useSharedValue(value ? 1 : 0)

  useEffect(() => {
    offset.value = withSpring(value ? 1 : 0, { damping: 20, stiffness: 200 })
  }, [value])

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * (size === 'sm' ? 14 : 18) }],
  }))

  const trackW = size === 'sm' ? 'w-8 h-5' : 'w-11 h-6'
  const thumbW = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      className={cn(
        'rounded-full p-0.5 justify-center',
        trackW,
        value ? 'bg-accent-500' : 'bg-gray-600',
        disabled && 'opacity-50',
      )}
    >
      <Animated.View
        className={cn('rounded-full bg-white', thumbW)}
        style={thumbStyle}
      />
    </Pressable>
  )
}
