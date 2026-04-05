import { apiClient } from '@/lib/api/client'
import type { Track, MusicQueue, NowPlaying, QueueItem, HistoryItem, MusicSettings } from './types'

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

export async function getNowPlaying(channelId: string): Promise<NowPlaying> {
  const res = await apiClient.get<{ data: NowPlaying }>(
    `/v1/channels/${channelId}/music/now-playing`,
  )
  return res.data.data
}

export async function getQueue(channelId: string): Promise<QueueItem[]> {
  const res = await apiClient.get<{ data: QueueItem[] }>(
    `/v1/channels/${channelId}/music/queue`,
  )
  return res.data.data
}

export async function getHistory(channelId: string): Promise<HistoryItem[]> {
  const res = await apiClient.get<{ data: HistoryItem[] }>(
    `/v1/channels/${channelId}/music/history`,
  )
  return res.data.data
}

export async function controlPlayback(
  channelId: string,
  action: 'play' | 'pause' | 'skip' | 'previous' | 'volume',
  value?: number,
): Promise<void> {
  await apiClient.post(`/v1/channels/${channelId}/music/control`, { action, value })
}

export async function addToQueue(channelId: string, query: string): Promise<QueueItem> {
  const res = await apiClient.post<{ data: QueueItem }>(
    `/v1/channels/${channelId}/music/queue`,
    { query },
  )
  return res.data.data
}

export async function removeFromQueue(channelId: string, position: number): Promise<void> {
  await apiClient.delete(`/v1/channels/${channelId}/music/queue/${position}`)
}

export async function getMusicSettings(channelId: string): Promise<MusicSettings> {
  const res = await apiClient.get<{ data: MusicSettings }>(
    `/v1/channels/${channelId}/music/settings`,
  )
  return res.data.data
}

export async function saveMusicSettings(
  channelId: string,
  settings: Partial<MusicSettings>,
): Promise<MusicSettings> {
  const res = await apiClient.patch<{ data: MusicSettings }>(
    `/v1/channels/${channelId}/music/settings`,
    settings,
  )
  return res.data.data
}
