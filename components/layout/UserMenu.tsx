import { View, Text, Pressable } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { LogOut } from 'lucide-react-native'

export function UserMenu() {
  const { user, logout } = useAuth()

  return (
    <View className="flex-row items-center gap-3 px-4 py-3 border-t border-border">
      <Avatar src={user?.profileImageUrl} name={user?.displayName} size="sm" />
      <View className="flex-1">
        <Text className="text-gray-200 text-sm font-medium">{user?.displayName}</Text>
        <Text className="text-gray-500 text-xs">{user?.login}</Text>
      </View>
      <Pressable onPress={logout} className="p-2">
        <LogOut size={16} color="rgb(156, 163, 175)" />
      </Pressable>
    </View>
  )
}
