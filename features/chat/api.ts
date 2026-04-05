import { apiClient } from '@/lib/api/client'
import type { ChatSettings } from './types'

export async function fetchChatSettings(channelId: string) {
  const res = await apiClient.get<ChatSettings>(`/channels/${channelId}/chat/settings`)
  return res.data
}

export async function updateChatSettings(channelId: string, settings: Partial<ChatSettings>) {
  const res = await apiClient.put<ChatSettings>(`/channels/${channelId}/chat/settings`, settings)
  return res.data
}
