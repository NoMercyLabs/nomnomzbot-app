import { apiClient } from '@/lib/api/client'
import type { Pipeline } from '@/types/pipeline'
import type { PipelineTestResult } from './types'

export async function fetchPipelines(channelId: string) {
  const res = await apiClient.get<Pipeline[]>(`/channels/${channelId}/pipelines`)
  return res.data
}

export async function fetchPipeline(channelId: string, id: string) {
  const res = await apiClient.get<Pipeline>(`/channels/${channelId}/pipelines/${id}`)
  return res.data
}

export async function createPipeline(channelId: string, data: Partial<Pipeline>) {
  const res = await apiClient.post<Pipeline>(`/channels/${channelId}/pipelines`, data)
  return res.data
}

export async function updatePipeline(channelId: string, id: string, data: Partial<Pipeline>) {
  const res = await apiClient.put<Pipeline>(`/channels/${channelId}/pipelines/${id}`, data)
  return res.data
}

export async function deletePipeline(channelId: string, id: string) {
  await apiClient.delete(`/channels/${channelId}/pipelines/${id}`)
}

export async function testPipeline(channelId: string, id: string) {
  const res = await apiClient.post<PipelineTestResult>(
    `/channels/${channelId}/pipelines/${id}/test`,
  )
  return res.data
}
