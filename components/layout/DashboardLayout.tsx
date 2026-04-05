import { View } from 'react-native'
import { Slot } from 'expo-router'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  return (
    <View className="flex-1 flex-row bg-gray-950">
      <Sidebar />
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  )
}
