import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { cn } from '@/lib/utils/cn'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, backHref, action, className }: PageHeaderProps) {
  const router = useRouter()

  return (
    <View className={cn('flex-row items-center justify-between px-6 py-4 border-b border-border', className)}>
      <View className="flex-row items-center gap-3 flex-1">
        {backHref && (
          <Pressable onPress={() => router.push(backHref as any)} className="p-1 -ml-1">
            <ChevronLeft size={22} color="rgb(156, 163, 175)" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-100">{title}</Text>
          {subtitle && <Text className="text-sm text-gray-400">{subtitle}</Text>}
        </View>
      </View>
      {action && <View>{action}</View>}
    </View>
  )
}
