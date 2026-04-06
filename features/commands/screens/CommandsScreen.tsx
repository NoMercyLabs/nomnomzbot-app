import { View, Text, TextInput, Pressable, ScrollView, FlatList } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useApiQuery } from '@/hooks/useApi'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { Plus, Search, Terminal } from 'lucide-react-native'
import { ErrorState } from '@/components/ui/ErrorState'
import type { CommandListItem } from '../types'

type FilterType = 'All' | 'Text' | 'Pipeline' | 'Counter' | 'Platform'

const FILTERS: FilterType[] = ['All', 'Text', 'Pipeline', 'Counter', 'Platform']

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  pipeline: { bg: 'rgba(124,58,237,0.2)', text: '#a78bfa' },
  text:     { bg: 'rgba(34,197,94,0.2)',  text: '#4ade80' },
  random:   { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
  counter:  { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
  platform: { bg: 'rgba(239,68,68,0.2)',  text: '#f87171' },
}

function TypeBadge({ type }: { type: string }) {
  const lower = (type ?? 'text').toLowerCase()
  const colors = TYPE_COLORS[lower] ?? TYPE_COLORS.text
  return (
    <View
      className="px-2 py-0.5 rounded"
      style={{ backgroundColor: colors.bg }}
    >
      <Text className="text-xs font-semibold capitalize" style={{ color: colors.text }}>
        {type ?? 'Text'}
      </Text>
    </View>
  )
}

function StatusDot({ enabled }: { enabled: boolean }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: enabled ? '#22c55e' : '#3d3566' }}
      />
      <Text className="text-xs" style={{ color: enabled ? '#4ade80' : '#5a5280' }}>
        {enabled ? 'Enabled' : 'Disabled'}
      </Text>
    </View>
  )
}

export function CommandsScreen() {
  const { t } = useFeatureTranslation('commands')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')

  const { data, isLoading, isError, refetch } = useApiQuery<CommandListItem[]>('commands', '/commands')

  const timedOut = useLoadingTimeout(isLoading)
  const showSkeleton = isLoading && !isError && !timedOut

  const filtered = (data ?? []).filter((cmd) => {
    const matchesSearch =
      !search ||
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      (cmd.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      activeFilter === 'All' ||
      (cmd as any).type?.toLowerCase() === activeFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <ErrorBoundary>
      <View className="flex-1" style={{ backgroundColor: '#141125' }}>
        <PageHeader
          title={t('title')}
          subtitle="Manage chat commands and automations"
          rightContent={
            <Button
              size="sm"
              onPress={() => router.push('/(dashboard)/commands/new' as any)}
              leftIcon={<Plus size={14} color="white" />}
              label={t('addNew')}
            />
          }
        />

        {/* Search + filters — single row */}
        <View
          className="flex-row items-center gap-3 px-5 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
        >
          <View
            className="flex-row items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35', width: 220 }}
          >
            <Search size={14} color="#5a5280" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search commands..."
              placeholderTextColor="#3d3566"
              className="flex-1 text-sm text-white"
              style={{ outlineStyle: 'none' } as any}
            />
          </View>
          <View className="flex-row gap-2">
            {FILTERS.map((f) => (
              <Pressable
                key={f}
                onPress={() => setActiveFilter(f)}
                className="px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: activeFilter === f ? 'rgba(124,58,237,0.25)' : 'transparent',
                  borderWidth: 1,
                  borderColor: activeFilter === f ? '#7C3AED' : '#2a2545',
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: activeFilter === f ? '#a78bfa' : '#5a5280' }}
                >
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-1" />
        </View>

        {/* Table header */}
        <View
          className="flex-row items-center px-5 py-2.5"
          style={{ backgroundColor: '#1A1530', borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
        >
          {[
            { label: 'NAME', flex: 2 },
            { label: 'TYPE', flex: 1 },
            { label: 'RESPONSE / PIPELINE', flex: 2 },
            { label: 'COOLDOWN', flex: 1 },
            { label: 'USES', flex: 1 },
            { label: 'STATUS', flex: 1 },
          ].map((col) => (
            <View key={col.label} style={{ flex: col.flex }}>
              <Text className="text-xs font-semibold tracking-wider" style={{ color: '#3d3566' }}>
                {col.label}
              </Text>
            </View>
          ))}
        </View>

        {isError ? (
          <ErrorState title="Unable to load commands" onRetry={refetch} />
        ) : showSkeleton ? (
          <View className="gap-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                className="flex-row items-center gap-3 px-5 py-3"
                style={{ backgroundColor: i % 2 === 0 ? '#141125' : '#16132b' }}
              >
                <View style={{ flex: 2 }}><Skeleton className="h-4 rounded" /></View>
                <View style={{ flex: 1 }}><Skeleton className="h-4 rounded" /></View>
                <View style={{ flex: 2 }}><Skeleton className="h-4 rounded" /></View>
                <View style={{ flex: 1 }}><Skeleton className="h-4 rounded" /></View>
                <View style={{ flex: 1 }}><Skeleton className="h-4 rounded" /></View>
                <View style={{ flex: 1 }}><Skeleton className="h-4 rounded" /></View>
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(cmd) => String(cmd.id)}
            renderItem={({ item: cmd, index }) => (
              <Pressable
                onPress={() => router.push(`/(dashboard)/commands/${cmd.name}` as any)}
                style={{ backgroundColor: index % 2 === 0 ? '#141125' : 'rgba(26,21,48,0.5)' }}
              >
                <View
                  className="flex-row items-center px-5 py-3"
                  style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
                >
                  <View style={{ flex: 2 }}>
                    <Text className="text-sm font-mono font-medium" style={{ color: '#a78bfa' }}>
                      !{cmd.name}
                    </Text>
                    {cmd.description ? (
                      <Text className="text-xs mt-0.5" style={{ color: '#5a5280' }} numberOfLines={1}>
                        {cmd.description}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <TypeBadge type={(cmd as any).type ?? 'Text'} />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text className="text-xs" style={{ color: '#8889a0' }} numberOfLines={1}>
                      {(cmd as any).response ?? (cmd as any).pipelineName ?? '—'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-xs" style={{ color: '#8889a0' }}>
                      {(cmd as any).cooldown ? `${(cmd as any).cooldown}s` : '—'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-xs font-semibold" style={{ color: '#8889a0' }}>
                      {(cmd as any).usageCount?.toLocaleString() ?? '—'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <StatusDot enabled={cmd.isEnabled} />
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="items-center py-16">
                <Text className="text-sm" style={{ color: '#3d3566' }}>
                  {search ? `No commands match "${search}"` : t('empty.title')}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </ErrorBoundary>
  )
}
