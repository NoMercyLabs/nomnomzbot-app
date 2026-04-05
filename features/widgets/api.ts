import { apiClient } from '@/lib/api/client'
import type { Widget, WidgetCreate, WidgetUpdate } from './types'

export const widgetsApi = {
  list: (broadcasterId: string) =>
    apiClient.get<Widget[]>(`/api/${broadcasterId}/widgets`).then((r) => r.data),

  get: (broadcasterId: string, id: string) =>
    apiClient.get<Widget>(`/api/${broadcasterId}/widgets/${id}`).then((r) => r.data),

  create: (broadcasterId: string, data: WidgetCreate) =>
    apiClient.post<Widget>(`/api/${broadcasterId}/widgets`, data).then((r) => r.data),

  update: (broadcasterId: string, id: string, data: WidgetUpdate) =>
    apiClient.patch<Widget>(`/api/${broadcasterId}/widgets/${id}`, data).then((r) => r.data),

  delete: (broadcasterId: string, id: string) =>
    apiClient.delete(`/api/${broadcasterId}/widgets/${id}`),
}
