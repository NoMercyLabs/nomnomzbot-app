import { View, ScrollView, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TimerCard } from '../components/TimerCard'
import { useTimers } from '../hooks/useTimers'
import { useToast } from '@/hooks/useToast'

export function TimersScreen() {
  const { timers, isLoading, refetch, isRefetching, updateTimer, deleteTimer } = useTimers()
  const toast = useToast()
  const activeCount = timers.filter((t) => t.isEnabled).length

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await updateTimer(id, { isEnabled: enabled })
    } catch {
      toast.error('Failed to update timer')
    }
  }

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title="Timers"
        subtitle={`${activeCount} active`}
        rightContent={
          <Button
            size="sm"
            onPress={() => router.push('/(dashboard)/timers/new' as any)}
            leftIcon={<Plus size={14} color="white" />}
            label="Add Timer"
          />
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-3"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </View>
        ) : timers.length === 0 ? (
          <EmptyState
            title="No timers yet"
            message="Create a timer to automatically post messages at set intervals."
            actionLabel="Create Timer"
            onAction={() => router.push('/(dashboard)/timers/new' as any)}
          />
        ) : (
          timers.map((timer) => (
            <TimerCard
              key={timer.id}
              timer={timer}
              onPress={() => router.push(`/(dashboard)/timers/${timer.id}` as any)}
              onToggle={(enabled) => handleToggle(timer.id, enabled)}
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}
