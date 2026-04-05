import { ScrollView, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { CommandForm } from '@/features/commands/components/CommandForm'
import type { Command } from '@/features/commands/types'

export default function CommandEditScreen() {
  const { name } = useLocalSearchParams<{ name: string }>()
  const isNew = name === 'new'

  const { data: command, isLoading } = useApiQuery<Command>(
    `commands/${name}`,
    `/commands/${name}`,
    { enabled: !isNew },
  )

  const createMutation = useApiMutation<Command, Partial<Command>>('/commands', 'post', {
    invalidateKeys: ['commands'],
    successMessage: 'Command created',
  })

  const updateMutation = useApiMutation<Command, Partial<Command>>(`/commands/${command?.id}`, 'put', {
    invalidateKeys: ['commands'],
    successMessage: 'Command saved',
  })

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader
        title={isNew ? 'New Command' : `Edit !${name}`}
        backHref="/(dashboard)/commands"
      />
      <View className="px-6 py-4">
        {isLoading ? (
          <View className="gap-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </View>
        ) : (
          <CommandForm
            command={isNew ? undefined : command}
            onSubmit={(data) => isNew ? createMutation.mutateAsync(data) : updateMutation.mutateAsync(data)}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </View>
    </ScrollView>
  )
}
