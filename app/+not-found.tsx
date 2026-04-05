import { Link, Stack } from 'expo-router'
import { View, Text } from 'react-native'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-2xl font-bold text-gray-100 mb-2">404</Text>
        <Text className="text-gray-400 mb-6">This screen doesn't exist.</Text>
        <Link href="/(dashboard)" className="text-accent-400">
          Go home
        </Link>
      </View>
    </>
  )
}
