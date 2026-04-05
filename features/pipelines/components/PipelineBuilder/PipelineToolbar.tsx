import { View, Text, Pressable } from 'react-native'
import { Plus, Save, Zap } from 'lucide-react-native'
import { NODE_REGISTRY } from '../nodes/registry'
import type { PipelineNode } from '@/types/pipeline'

interface PipelineToolbarProps {
  isDirty: boolean
  onAddNode: (node: PipelineNode) => void
  onSave: () => void
}

export function PipelineToolbar({ isDirty, onAddNode, onSave }: PipelineToolbarProps) {
  function addTriggerNode() {
    const def = NODE_REGISTRY.find((n) => n.type === 'trigger')
    if (!def) return
    onAddNode({
      id: crypto.randomUUID(),
      type: 'trigger',
      nodeType: def.nodeType,
      label: def.label,
      config: {},
      position: { x: 0, y: 0 },
    })
  }

  function addActionNode() {
    const def = NODE_REGISTRY.find((n) => n.type === 'action')
    if (!def) return
    onAddNode({
      id: crypto.randomUUID(),
      type: 'action',
      nodeType: def.nodeType,
      label: def.label,
      config: {},
      position: { x: 0, y: 0 },
    })
  }

  return (
    <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
      <Pressable
        onPress={addTriggerNode}
        className="flex-row items-center gap-1.5 rounded-lg bg-green-900 border border-green-700 px-3 py-2"
      >
        <Plus size={14} color="rgb(134,239,172)" />
        <Text className="text-green-300 text-sm font-medium">Trigger</Text>
      </Pressable>

      <Pressable
        onPress={addActionNode}
        className="flex-row items-center gap-1.5 rounded-lg bg-blue-900 border border-blue-700 px-3 py-2"
      >
        <Plus size={14} color="rgb(147,197,253)" />
        <Text className="text-blue-300 text-sm font-medium">Action</Text>
      </Pressable>

      <View className="flex-1" />

      {isDirty && (
        <Pressable
          onPress={onSave}
          className="flex-row items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-2"
        >
          <Save size={14} color="white" />
          <Text className="text-white text-sm font-medium">Save</Text>
        </Pressable>
      )}
    </View>
  )
}
