import { View, Text, Pressable, Modal, ScrollView } from 'react-native'
import { useState } from 'react'
import { Plus, Save, ChevronRight, X } from 'lucide-react-native'
import { NODE_REGISTRY } from '../nodes/registry'
import type { PipelineNode } from '@/types/pipeline'
import type { NodeCategory } from '@/types/pipeline'

interface PipelineToolbarProps {
  isDirty: boolean
  onAddNode: (node: PipelineNode) => void
  onSave: () => void
}

const CATEGORY_STYLES: Record<NodeCategory, { bg: string; border: string; text: string; badge: string }> = {
  trigger: { bg: 'bg-green-900', border: 'border-green-700', text: 'text-green-300', badge: 'bg-green-800' },
  condition: { bg: 'bg-amber-900', border: 'border-amber-700', text: 'text-amber-300', badge: 'bg-amber-800' },
  action: { bg: 'bg-blue-900', border: 'border-blue-700', text: 'text-blue-300', badge: 'bg-blue-800' },
}

const CATEGORY_LABELS: Record<NodeCategory, string> = {
  trigger: 'Triggers',
  condition: 'Conditions',
  action: 'Actions',
}

function NodePickerModal({
  visible,
  category,
  onClose,
  onSelect,
}: {
  visible: boolean
  category: NodeCategory | null
  onClose: () => void
  onSelect: (node: PipelineNode) => void
}) {
  const nodes = NODE_REGISTRY.filter((n) => !category || n.category === category)
  const categories: NodeCategory[] = category ? [category] : ['trigger', 'condition', 'action']

  function select(nodeType: string) {
    const def = NODE_REGISTRY.find((n) => n.nodeType === nodeType)
    if (!def) return
    const defaultConfig: Record<string, unknown> = { ...def.defaultConfig }
    onSelect({
      id: crypto.randomUUID(),
      type: def.category,
      nodeType: def.nodeType,
      label: def.label,
      config: defaultConfig,
      position: { x: 0, y: 0 },
    })
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 items-center justify-center px-4" onPress={onClose}>
        <Pressable
          className="w-full max-w-sm rounded-xl border border-border bg-gray-900 overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <Text className="text-sm font-semibold text-gray-100">
              {category ? `Add ${CATEGORY_LABELS[category]}` : 'Add Node'}
            </Text>
            <Pressable onPress={onClose} className="p-1">
              <X size={16} color="#8889a0" />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 480 }}>
            {categories.map((cat) => {
              const catNodes = nodes.filter((n) => n.category === cat)
              if (catNodes.length === 0) return null
              const styles = CATEGORY_STYLES[cat]
              return (
                <View key={cat}>
                  {!category && (
                    <View className={`px-4 py-2 ${styles.bg}`}>
                      <Text className={`text-xs font-semibold uppercase ${styles.text}`}>
                        {CATEGORY_LABELS[cat]}
                      </Text>
                    </View>
                  )}
                  {catNodes.map((node) => (
                    <Pressable
                      key={node.nodeType}
                      onPress={() => select(node.nodeType)}
                      className="flex-row items-center gap-3 px-4 py-3 border-b border-border active:bg-surface-overlay"
                    >
                      <View className={`rounded px-1.5 py-0.5 ${styles.badge}`}>
                        <Text className={`text-xs font-medium ${styles.text}`}>
                          {node.category}
                        </Text>
                      </View>
                      <View className="flex-1 gap-0.5">
                        <Text className="text-sm font-medium text-gray-200">{node.label}</Text>
                        <Text className="text-xs text-gray-500">{node.description}</Text>
                      </View>
                      <ChevronRight size={14} color="#5a5b72" />
                    </Pressable>
                  ))}
                </View>
              )
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export function PipelineToolbar({ isDirty, onAddNode, onSave }: PipelineToolbarProps) {
  const [pickerCategory, setPickerCategory] = useState<NodeCategory | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  function openPicker(category: NodeCategory | null) {
    setPickerCategory(category)
    setShowPicker(true)
  }

  return (
    <>
      <View className="flex-row items-center gap-2 border-b border-border px-4 py-3 flex-wrap">
        {(['trigger', 'condition', 'action'] as NodeCategory[]).map((cat) => {
          const styles = CATEGORY_STYLES[cat]
          return (
            <Pressable
              key={cat}
              onPress={() => openPicker(cat)}
              className={`flex-row items-center gap-1.5 rounded-lg border px-3 py-2 ${styles.bg} ${styles.border}`}
            >
              <Plus size={13} color={undefined} className={styles.text} />
              <Text className={`text-sm font-medium ${styles.text} capitalize`}>{cat}</Text>
            </Pressable>
          )
        })}

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

      <NodePickerModal
        visible={showPicker}
        category={pickerCategory}
        onClose={() => setShowPicker(false)}
        onSelect={onAddNode}
      />
    </>
  )
}
