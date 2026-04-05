import { apiClient } from '@/lib/api/client'
import type { Command, CommandCreate, CommandUpdate } from './types'

export async function fetchCommands(channelId: string) {
  const res = await apiClient.get<Command[]>(`/channels/${channelId}/commands`)
  return res.data
}

export async function fetchCommand(channelId: string, name: string) {
  const res = await apiClient.get<Command>(`/channels/${channelId}/commands/${name}`)
  return res.data
}

export async function createCommand(channelId: string, data: CommandCreate) {
  const res = await apiClient.post<Command>(`/channels/${channelId}/commands`, data)
  return res.data
}

export async function updateCommand(channelId: string, id: string, data: CommandUpdate) {
  const res = await apiClient.put<Command>(`/channels/${channelId}/commands/${id}`, data)
  return res.data
}

export async function deleteCommand(channelId: string, id: string) {
  await apiClient.delete(`/channels/${channelId}/commands/${id}`)
}
