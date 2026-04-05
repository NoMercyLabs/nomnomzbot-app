import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useChannelStore } from '@/stores/useChannelStore'
import { timersApi } from '../api'
import type { TimerCreate, TimerUpdate } from '../types'

export function useTimers() {
  const qc = useQueryClient()
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data: timers = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['timers', broadcasterId],
    queryFn: () => timersApi.list(broadcasterId!),
    enabled: !!broadcasterId,
  })

  const createMutation = useMutation({
    mutationFn: (data: TimerCreate) => timersApi.create(broadcasterId!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timers', broadcasterId] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TimerUpdate }) =>
      timersApi.update(broadcasterId!, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timers', broadcasterId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => timersApi.delete(broadcasterId!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timers', broadcasterId] }),
  })

  return {
    timers,
    isLoading,
    refetch,
    isRefetching,
    createTimer: createMutation.mutateAsync,
    updateTimer: (id: string, data: TimerUpdate) => updateMutation.mutateAsync({ id, data }),
    deleteTimer: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}

export function useTimer(id: string) {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  return useQuery({
    queryKey: ['timers', broadcasterId, id],
    queryFn: () => timersApi.get(broadcasterId!, id),
    enabled: !!broadcasterId && !!id && id !== 'new',
  })
}
