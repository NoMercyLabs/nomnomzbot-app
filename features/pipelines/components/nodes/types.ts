import type { NodeCategory } from '@/types/pipeline'

export interface NodeDefinition {
  nodeType: string
  type: NodeCategory
  label: string
  description: string
  configSchema?: Record<string, unknown>
}
