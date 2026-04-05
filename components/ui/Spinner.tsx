import { ActivityIndicator, View } from 'react-native'

interface SpinnerProps {
  size?: 'small' | 'large'
  color?: string
  className?: string
}

export function Spinner({ size = 'small', color = '#a855f7' }: SpinnerProps) {
  return <ActivityIndicator size={size} color={color} />
}

export function FullScreenSpinner() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-950">
      <ActivityIndicator size="large" color="#a855f7" />
    </View>
  )
}
