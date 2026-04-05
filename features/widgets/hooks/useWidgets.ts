import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useChannelStore } from '@/stores/useChannelStore'
import { widgetsApi } from '../api'
import type { WidgetCreate, WidgetUpdate } from '../types'

export function useWidgets() {
  const qc = useQueryClient()
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data: widgets = [], isLoading } = useQuery({
    queryKey: ['widgets', broadcasterId],
    queryFn: () => widgetsApi.list(broadcasterId!),
    enabled: !!broadcasterId,
  })

  const createMutation = useMutation({
    mutationFn: (data: WidgetCreate) => widgetsApi.create(broadcasterId!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['widgets', broadcasterId] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WidgetUpdate }) =>
      widgetsApi.update(broadcasterId!, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['widgets', broadcasterId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => widgetsApi.delete(broadcasterId!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['widgets', broadcasterId] }),
  })

  return {
    widgets,
    isLoading,
    createWidget: createMutation.mutateAsync,
    updateWidget: (id: string, data: WidgetUpdate) => updateMutation.mutateAsync({ id, data }),
    deleteWidget: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

export function useWidget(id: string) {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  return useQuery({
    queryKey: ['widgets', broadcasterId, id],
    queryFn: () => widgetsApi.get(broadcasterId!, id),
    enabled: !!broadcasterId && !!id && id !== 'new',
  })
}
