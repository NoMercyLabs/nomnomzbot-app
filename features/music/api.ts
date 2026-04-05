import { apiClient } from '@/lib/api/client'
import type { Track, MusicQueue } from './types'

export async function fetchMusicQueue(channelId: string) {
  const res = await apiClient.get<MusicQueue>(`/channels/${channelId}/music/queue`)
  return res.data
}

export async function skipTrack(channelId: string) {
  await apiClient.post(`/channels/${channelId}/music/skip`)
}

export async function requestSong(channelId: string, query: string) {
  const res = await apiClient.post<Track>(`/channels/${channelId}/music/request`, { query })
  return res.data
}
