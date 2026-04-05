import { apiClient } from '@/lib/api/client'
import type { BotSettings } from './types'

export async function fetchSettings(channelId: string) {
  const res = await apiClient.get<BotSettings>(`/channels/${channelId}/settings`)
  return res.data
}

export async function updateSettings(channelId: string, data: Partial<BotSettings>) {
  const res = await apiClient.put<BotSettings>(`/channels/${channelId}/settings`, data)
  return res.data
}
