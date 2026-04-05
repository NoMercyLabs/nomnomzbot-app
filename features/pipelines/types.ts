export type { Pipeline, PipelineNode, PipelineGraph, NodeType, PipelineNodeConfig } from '@/types/pipeline'

export interface PipelineTestResult {
  success: boolean
  log: string[]
  duration: number
  error?: string
}
