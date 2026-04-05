import { ScrollView, View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus, Edit, Trash2 } from 'lucide-react-native'

interface Command {
  id: string
  name: string
  response: string
  cooldown: number
  enabled: boolean
  permission: string
}

export default function CommandsScreen() {
  const router = useRouter()
  const { data: commands, isLoading } = useApiQuery<Command[]>('commands', '/commands')
  const deleteMutation = useApiMutation<void, string>('/commands', 'delete', {
    invalidateKeys: ['commands'],
    successMessage: 'Command deleted',
  })

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader
        title="Commands"
        action={
          <Pressable
            onPress={() => router.push('/(dashboard)/commands/new')}
            className="flex-row items-center gap-2 rounded-lg bg-accent-600 px-4 py-2"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-medium">New</Text>
          </Pressable>
        }
      />
      <View className="px-6 py-4 gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))
          : commands?.map((cmd) => (
              <Card key={cmd.id} className="flex-row items-center justify-between p-4">
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-gray-100 font-medium">!{cmd.name}</Text>
                    {!cmd.enabled && <Badge label="Disabled" variant="secondary" />}
                  </View>
                  <Text className="text-gray-400 text-sm" numberOfLines={1}>{cmd.response}</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => router.push(`/(dashboard)/commands/${cmd.name}`)}
                    className="p-2"
                  >
                    <Edit size={16} color="rgb(156,163,175)" />
                  </Pressable>
                  <Pressable onPress={() => deleteMutation.mutate(cmd.id)} className="p-2">
                    <Trash2 size={16} color="rgb(239,68,68)" />
                  </Pressable>
                </View>
              </Card>
            ))}
      </View>
    </ScrollView>
  )
}
