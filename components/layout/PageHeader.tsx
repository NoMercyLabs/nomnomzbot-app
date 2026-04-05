import { View, Text, Pressable } from 'react-native'
import { useNavigation } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { cn } from '@/lib/utils/cn'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightContent?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, showBack, rightContent, className }: PageHeaderProps) {
  const nav = useNavigation()

  return (
    <View className={cn('flex-row items-center justify-between py-2', className)}>
      <View className="flex-row items-center gap-3 flex-1">
        {showBack && (
          <Pressable onPress={() => nav.goBack()} className="rounded-lg p-1.5 active:bg-gray-800">
            <ArrowLeft size={20} color="#9ca3af" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-xl font-bold text-white" numberOfLines={1}>{title}</Text>
          {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
        </View>
      </View>
      {rightContent && <View>{rightContent}</View>}
    </View>
  )
}
