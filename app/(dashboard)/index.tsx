import { ScrollView, View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useChannel } from '@/hooks/useChannel'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useActivityFeed } from '@/features/dashboard/hooks/useActivityFeed'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatNumber, formatRelativeTime } from '@/lib/utils/format'
import {
  Users, UserPlus, Terminal, MessageSquare,
  Heart, Star, Radio, Zap, Gift,
  Edit2, Play, Sword, Scissors, Users2, Hash,
  TrendingUp, Film,
} from 'lucide-react-native'
import type { DashboardStats, ActivityEvent, TopCommand } from '@/features/dashboard/types'
import { ErrorState } from '@/components/ui/ErrorState'
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout'

const QUICK_ACTIONS = [
  { label: 'Change Title', href: '/(dashboard)/stream', icon: Edit2, color: '#a78bfa', bg: 'rgba(124,58,237,0.15)' },
  { label: 'Run Ad', href: '/(dashboard)/stream', icon: Play, color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
  { label: 'Shield Mode', href: '/(dashboard)/moderation', icon: Sword, color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  { label: 'Create Clip', href: '/(dashboard)/stream', icon: Scissors, color: '#4ade80', bg: 'rgba(34,197,94,0.15)' },
  { label: 'Start Raid', href: '/(dashboard)/stream', icon: Radio, color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
  { label: 'Chat Mode', href: '/(dashboard)/chat', icon: MessageSquare, color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
]

const EVENT_ICONS: Record<ActivityEvent['type'], typeof Heart> = {
  follow: Heart,
  subscribe: Star,
  raid: Radio,
  cheer: Zap,
  command: Terminal,
  redemption: Gift,
}

const EVENT_COLORS: Record<ActivityEvent['type'], string> = {
  follow: '#22c55e',
  subscribe: '#a78bfa',
  raid: '#f59e0b',
  cheer: '#60a5fa',
  command: '#4ade80',
  redemption: '#f472b6',
}

const EVENT_LABEL_KEYS: Record<ActivityEvent['type'], string> = {
  follow: 'followed',
  subscribe: 'subscribed',
  raid: 'raided',
  cheer: 'cheered',
  command: 'used a command',
  redemption: 'redeemed a reward',
}

export default function DashboardScreen() {
  const { currentChannel } = useChannel()
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const { events } = useActivityFeed()
  const { t } = useFeatureTranslation('dashboard')
  const { isDesktop } = useBreakpoint()

  const { data: stats, isLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats', broadcasterId],
    queryFn: () =>
      apiClient
        .get<{ data: DashboardStats }>(`/api/v1/dashboard/${broadcasterId}/stats`)
        .then((r) => r.data.data),
    enabled: !!broadcasterId,
    refetchInterval: 30_000,
  })

  const timedOut = useLoadingTimeout(isLoading)
  const showSkeleton = isLoading && !isError && !timedOut

  if (isError || timedOut) {
    return (
      <View style={{ flex: 1, backgroundColor: '#141125' }}>
        <PageHeader title={currentChannel?.displayName ?? t('title')} />
        <ErrorState title="Unable to load dashboard" onRetry={refetch} />
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#141125' }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <PageHeader
        title={currentChannel?.displayName ?? t('title')}
        subtitle={stats?.streamTitle ?? 'Overview of your channel'}
        rightContent={
          stats?.isLive ? (
            <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded"
              style={{ backgroundColor: '#22c55e' }}>
              <View className="w-1.5 h-1.5 rounded-full bg-white" />
              <Text className="text-xs font-bold text-white">LIVE</Text>
            </View>
          ) : (
            <View className="px-2.5 py-1 rounded" style={{ backgroundColor: '#231D42' }}>
              <Text className="text-xs font-medium" style={{ color: '#5a5280' }}>OFFLINE</Text>
            </View>
          )
        }
      />

      <View className="px-5 py-4 gap-5">
        {/* Stream Banner */}
        <View
          className="rounded-xl overflow-hidden flex-row items-center gap-0"
          style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
        >
          {/* Thumbnail */}
          <View className="items-center justify-center gap-1" style={{ width: 120, height: 68, backgroundColor: '#231D42', flexShrink: 0 }}>
            <Film size={20} color="#3d3566" />
            <Text style={{ fontSize: 9, color: '#3d3566', letterSpacing: 1 }}>NO PREVIEW</Text>
          </View>

          {/* Stream Info */}
          <View className="flex-1 px-4 py-3 gap-1">
            {stats?.isLive ? (
              <View className="flex-row items-center gap-2">
                <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#ef4444' }}>
                  <Text className="text-xs font-bold text-white" style={{ fontSize: 10 }}>LIVE</Text>
                </View>
                {stats.uptime != null && (
                  <Text className="text-xs" style={{ color: '#8889a0' }}>
                    Started {Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m ago
                  </Text>
                )}
              </View>
            ) : (
              <Text className="text-xs" style={{ color: '#5a5280' }}>Not streaming</Text>
            )}
            <Text className="text-sm font-semibold text-white" numberOfLines={1}>
              {stats?.streamTitle ?? 'No title set'}
            </Text>
            <Text className="text-xs" style={{ color: '#8889a0' }}>
              {[stats?.gameName, stats?.language ? stats.language.toUpperCase() : null].filter(Boolean).join(' · ') || 'No category'}
            </Text>
          </View>

          {/* Viewers */}
          {stats?.isLive && (
            <View className="items-center px-5 py-3" style={{ borderLeftWidth: 1, borderLeftColor: '#1e1a35' }}>
              <Text className="text-2xl font-bold text-white">
                {formatNumber(stats.viewerCount ?? 0)}
              </Text>
              <Text className="text-xs" style={{ color: '#5a5280' }}>viewers</Text>
            </View>
          )}
        </View>

        {/* Stat cards */}
        {showSkeleton ? (
          <View className="flex-row gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 flex-1 rounded-xl" />
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-4">
            <StatCard
              icon={<Users size={16} color="#a78bfa" />}
              label="Peak Viewers"
              value={formatNumber(stats?.viewerCount ?? 0)}
              delta="+12% vs last"
              deltaPositive
              accentColor="#7C3AED"
            />
            <StatCard
              icon={<UserPlus size={16} color="#60a5fa" />}
              label="New Followers"
              value={formatNumber(stats?.followerCount ?? 0)}
              delta="+8 this hour"
              deltaPositive
              accentColor="#3b82f6"
            />
            <StatCard
              icon={<Star size={16} color="#4ade80" />}
              label="Subscribers"
              value={formatNumber(stats?.subscriberCount ?? 0)}
              delta="+3 today"
              deltaPositive
              accentColor="#22c55e"
            />
            <StatCard
              icon={<Terminal size={16} color="#fbbf24" />}
              label="Commands Used"
              value={formatNumber(stats?.commandsUsed ?? 0)}
              delta="+22% vs avg"
              deltaPositive
              accentColor="#f59e0b"
            />
          </View>
        )}

        {/* Two-column layout on desktop */}
        {isDesktop ? (
          <View className="flex-row gap-6" style={{ alignItems: 'flex-start' }}>
            {/* Left: Recent Activity */}
            <View className="gap-4" style={{ flex: 10 }}>
              <RecentActivitySection events={events} />
            </View>

            {/* Right: Quick Actions */}
            <View className="gap-4" style={{ flex: 4, minWidth: 300 }}>
              <QuickActionsSection />
              <TopCommandsSection stats={stats} />
            </View>
          </View>
        ) : (
          <>
            <QuickActionsSection />
            <RecentActivitySection events={events} />
            <TopCommandsSection stats={stats} />
          </>
        )}
      </View>
    </ScrollView>
  )
}

function RecentActivitySection({ events }: { events: ActivityEvent[] }) {
  return (
    <View className="gap-2.5">
      <Text className="text-sm font-semibold text-white px-0.5">Recent Activity</Text>
      <View
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
      >
        {events.length === 0 ? (
          <View className="items-center py-10">
            <Hash size={28} color="#2e2757" />
            <Text className="text-sm mt-3" style={{ color: '#3d3566' }}>No recent activity</Text>
            <Text className="text-xs mt-1" style={{ color: '#2e2757' }}>
              Activity appears when you go live
            </Text>
          </View>
        ) : (
          events.slice(0, 10).map((event, index) => {
            const Icon = EVENT_ICONS[event.type] ?? Zap
            const color = EVENT_COLORS[event.type] ?? '#22c55e'
            const label = EVENT_LABEL_KEYS[event.type] ?? event.type
            return (
              <View
                key={event.id}
                className="flex-row items-center gap-3 px-4 py-3"
                style={index > 0 ? { borderTopWidth: 1, borderTopColor: '#1e1a35' } : undefined}
              >
                <View
                  className="h-7 w-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={13} color={color} />
                </View>
                <View className="flex-1 flex-row items-center gap-1 flex-wrap">
                  <Text className="text-sm font-semibold" style={{ color: '#a78bfa' }}>
                    {event.displayName}
                  </Text>
                  <Text className="text-sm" style={{ color: '#8889a0' }}>{label}</Text>
                </View>
                <Text className="text-xs" style={{ color: '#3d3566' }}>
                  {formatRelativeTime(event.timestamp)}
                </Text>
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}

function QuickActionsSection() {
  return (
    <View className="gap-2.5">
      <Text className="text-sm font-semibold text-white px-0.5">Quick Actions</Text>
      {/* 3-column grid of action buttons */}
      <View className="gap-3">
        {[QUICK_ACTIONS.slice(0, 3), QUICK_ACTIONS.slice(3, 6)].map((row, rowIdx) => (
          <View key={rowIdx} className="flex-row gap-3">
            {row.map((action) => {
              const Icon = action.icon
              return (
                <Pressable
                  key={action.label}
                  onPress={() => router.push(action.href as any)}
                  className="flex-1 rounded-xl items-center justify-center gap-2 py-4"
                  style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35', minHeight: 80 }}
                >
                  <View
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: action.bg }}
                  >
                    <Icon size={18} color={action.color} />
                  </View>
                  <Text className="text-xs font-medium text-center" style={{ color: '#cdcede' }} numberOfLines={2}>
                    {action.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

function TopCommandsSection({ stats }: { stats?: DashboardStats }) {
  const topCommands: TopCommand[] = stats?.topCommands ?? []

  return (
    <View className="gap-2.5">
      <Text className="text-sm font-semibold text-white px-0.5">Top Commands Today</Text>
      <View
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
      >
        {/* Table header row */}
        <View className="flex-row items-center px-4 py-2" style={{ backgroundColor: '#231D42', borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}>
          <View style={{ flex: 2 }}>
            <Text className="text-xs font-semibold tracking-wider" style={{ color: '#3d3566' }}>COMMAND</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text className="text-xs font-semibold tracking-wider" style={{ color: '#3d3566' }}>USES</Text>
          </View>
        </View>
        {topCommands.length === 0 && (
          <View className="items-center py-8">
            <Terminal size={24} color="#2e2757" />
            <Text className="text-xs mt-2" style={{ color: '#3d3566' }}>No commands used yet today</Text>
          </View>
        )}
        {topCommands.slice(0, 5).map((cmd, i) => (
          <View
            key={cmd.name}
            className="flex-row items-center justify-between px-4 py-3"
            style={i > 0 ? { borderTopWidth: 1, borderTopColor: '#1e1a35' } : undefined}
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-xs w-4 text-right" style={{ color: '#3d3566' }}>{i + 1}</Text>
              <Text className="text-sm font-mono font-medium" style={{ color: '#a78bfa' }}>
                {cmd.name}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <TrendingUp size={11} color="#22c55e" />
              <Text className="text-xs font-semibold" style={{ color: '#8889a0' }}>{cmd.uses}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

function StatCard({
  icon,
  label,
  value,
  delta,
  deltaPositive,
  accentColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  accentColor: string
}) {
  return (
    <View
      className="flex-1 rounded-xl px-4 py-4 gap-1.5"
      style={{
        backgroundColor: '#1A1530',
        borderWidth: 1,
        borderColor: '#1e1a35',
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
        minWidth: 130,
      }}
    >
      <View className="flex-row items-center justify-between">
        {icon}
        {delta && (
          <View className="flex-row items-center gap-0.5">
            <TrendingUp size={10} color={deltaPositive ? '#22c55e' : '#ef4444'} />
            <Text
              className="text-xs font-semibold"
              style={{ color: deltaPositive ? '#22c55e' : '#ef4444' }}
            >
              {delta}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-white">{value}</Text>
      <Text className="text-xs" style={{ color: '#5a5280' }}>{label}</Text>
    </View>
  )
}
