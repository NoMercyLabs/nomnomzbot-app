import { View, Text, ScrollView, Pressable, Modal, Alert, Platform, RefreshControl } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import {
  Bell, MessageSquare, Target, Trophy, Music,
  List, Hash, Code2, Plus, Copy, ExternalLink,
  Trash2, ChevronRight, Layers,
} from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Modal as AppModal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useWidgets } from '../hooks/useWidgets'
import { useToast } from '@/hooks/useToast'
import { WIDGET_TYPE_LABELS, WIDGET_TYPE_DESCRIPTIONS, type WidgetType, type Widget } from '../types'
import * as Clipboard from 'expo-clipboard'

const WIDGET_ICONS: Record<WidgetType, typeof Bell> = {
  alert: Bell,
  chat: MessageSquare,
  goal: Target,
  leaderboard: Trophy,
  nowplaying: Music,
  eventlist: List,
  counter: Hash,
  custom: Code2,
}

const WIDGET_COLORS: Record<WidgetType, string> = {
  alert: '#f59e0b',
  chat: '#3b82f6',
  goal: '#10b981',
  leaderboard: '#a855f7',
  nowplaying: '#1DB954',
  eventlist: '#06b6d4',
  counter: '#8b5cf6',
  custom: '#6b7280',
}

const WIDGET_TYPES_LIST: WidgetType[] = [
  'alert', 'chat', 'goal', 'leaderboard', 'nowplaying', 'eventlist', 'counter', 'custom',
]

function WidgetCard({ widget, onToggle, onDelete, onCopyUrl }: {
  widget: Widget
  onToggle: (enabled: boolean) => void
  onDelete: () => void
  onCopyUrl: () => void
}) {
  const Icon = WIDGET_ICONS[widget.type] ?? Layers
  const color = WIDGET_COLORS[widget.type] ?? '#6b7280'

  return (
    <Pressable onPress={() => router.push(`/(dashboard)/widgets/${widget.id}` as any)}>
      <Card className="gap-3">
        <View className="flex-row items-start gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={20} color={color} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-gray-100">{widget.name}</Text>
            <Text className="text-xs text-gray-500">{WIDGET_TYPE_LABELS[widget.type]}</Text>
          </View>
          <Toggle value={widget.isEnabled} onValueChange={onToggle} />
        </View>

        {widget.overlayUrl && (
          <View className="flex-row items-center gap-2 rounded-md bg-gray-800 px-3 py-2">
            <Text className="flex-1 text-xs text-gray-400 font-mono" numberOfLines={1}>
              {widget.overlayUrl}
            </Text>
            <Pressable onPress={onCopyUrl} className="p-1">
              <Copy size={13} color="#8889a0" />
            </Pressable>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <Badge
            variant={widget.isEnabled ? 'success' : 'muted'}
            label={widget.isEnabled ? 'Active' : 'Inactive'}
          />
          <View className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onPress={onDelete}
            leftIcon={<Trash2 size={13} color="#ef4444" />}
            label="Delete"
          />
          <ChevronRight size={14} color="#5a5b72" />
        </View>
      </Card>
    </Pressable>
  )
}

function CreateWidgetModal({ visible, onClose, onCreate }: {
  visible: boolean
  onClose: () => void
  onCreate: (type: WidgetType) => void
}) {
  return (
    <AppModal visible={visible} onClose={onClose} title="Add Widget">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          {WIDGET_TYPES_LIST.map((type) => {
            const Icon = WIDGET_ICONS[type]
            const color = WIDGET_COLORS[type]
            return (
              <Pressable
                key={type}
                onPress={() => onCreate(type)}
                className="flex-row items-center gap-3 rounded-xl border border-border p-3 active:bg-surface-overlay"
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={20} color={color} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-gray-200">
                    {WIDGET_TYPE_LABELS[type]}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {WIDGET_TYPE_DESCRIPTIONS[type]}
                  </Text>
                </View>
                <ChevronRight size={14} color="#5a5b72" />
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </AppModal>
  )
}

export function WidgetsScreen() {
  const { widgets, isLoading, refetch, isRefetching, createWidget, updateWidget, deleteWidget } = useWidgets()
  const toast = useToast()
  const [showCreate, setShowCreate] = useState(false)

  async function handleCreate(type: WidgetType) {
    setShowCreate(false)
    try {
      const widget = await createWidget({
        name: WIDGET_TYPE_LABELS[type],
        type,
      })
      toast.success(`${WIDGET_TYPE_LABELS[type]} created`)
      router.push(`/(dashboard)/widgets/${widget.id}` as any)
    } catch {
      toast.error('Failed to create widget')
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await updateWidget(id, { isEnabled: enabled })
    } catch {
      toast.error('Failed to update widget')
    }
  }

  async function handleDelete(widget: Widget) {
    Alert.alert(
      'Delete Widget',
      `Delete "${widget.name}"? The overlay URL will stop working.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWidget(widget.id)
              toast.success('Widget deleted')
            } catch {
              toast.error('Failed to delete widget')
            }
          },
        },
      ],
    )
  }

  async function handleCopyUrl(url: string) {
    await Clipboard.setStringAsync(url)
    toast.success('URL copied to clipboard')
  }

  return (
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title="Widgets"
        subtitle={`${widgets.filter((w) => w.isEnabled).length} active overlays`}
        rightContent={
          <Button
            size="sm"
            onPress={() => setShowCreate(true)}
            leftIcon={<Plus size={14} color="white" />}
            label="Add Widget"
          />
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-3"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9146FF" />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </View>
        ) : widgets.length === 0 ? (
          <EmptyState
            title="No widgets yet"
            message="Create overlay widgets to display alerts, chat, goals, and more on your stream."
            actionLabel="Add Widget"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onToggle={(enabled) => handleToggle(widget.id, enabled)}
              onDelete={() => handleDelete(widget)}
              onCopyUrl={() => widget.overlayUrl && handleCopyUrl(widget.overlayUrl)}
            />
          ))
        )}

        {widgets.length > 0 && (
          <Card className="items-center gap-2 py-6">
            <ExternalLink size={24} color="#5a5b72" />
            <Text className="text-sm font-medium text-gray-300">OBS Setup</Text>
            <Text className="text-xs text-center text-gray-500 px-4">
              Add widget overlay URLs as Browser Sources in OBS, Streamlabs, or any streaming software.
            </Text>
          </Card>
        )}
      </ScrollView>

      <CreateWidgetModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </View>
  )
}
