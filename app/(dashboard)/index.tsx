import { ScrollView, View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useChannel } from '@/hooks/useChannel'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useActivityFeed } from '@/features/dashboard/hooks/useActivityFeed'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatNumber, formatRelativeTime } from '@/lib/utils/format'
import {
  Users, UserPlus, MessageSquare, Terminal, Clock, Zap,
  Heart, Star, Radio, Gift, ChevronRight,
} from 'lucide-react-native'
import type { DashboardStats, ActivityEvent } from '@/features/dashboard/types'

const QUICK_ACTIONS = [
  { labelKey: 'nav.commands', href: '/(dashboard)/commands', icon: Terminal, color: '#a855f7' },
  { labelKey: 'nav.timers', href: '/(dashboard)/timers', icon: Clock, color: '#3b82f6' },
  { labelKey: 'nav.chat', href: '/(dashboard)/chat', icon: MessageSquare, color: '#10b981' },
  { labelKey: 'nav.pipelines', href: '/(dashboard)/pipelines', icon: Zap, color: '#f59e0b' },
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
  follow: '#ec4899',
  subscribe: '#a855f7',
  raid: '#ef4444',
  cheer: '#f59e0b',
  command: '#6b7280',
  redemption: '#06b6d4',
}

type EventLabelKey = 'followed' | 'subscribed' | 'raided' | 'cheered' | 'usedCommand' | 'redeemedReward'

const EVENT_LABEL_KEYS: Record<ActivityEvent['type'], EventLabelKey> = {
  follow: 'followed',
  subscribe: 'subscribed',
  raid: 'raided',
  cheer: 'cheered',
  command: 'usedCommand',
  redemption: 'redeemedReward',
}

export default function DashboardScreen() {
  const { currentChannel } = useChannel()
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const { events } = useActivityFeed()
  const { t: tCommon } = useTranslation('common')
  const { t } = useFeatureTranslation('dashboard')

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats', broadcasterId],
    queryFn: () => apiClient.get(`/api/dashboard/${broadcasterId}/stats`).then((r) => r.data),
    enabled: !!broadcasterId,
    refetchInterval: 30_000,
  })

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8">
      <PageHeader
        title={currentChannel?.displayName ?? t('title')}
        subtitle={stats?.streamTitle}
        rightContent={
          stats?.isLive ? (
            <Badge variant="danger" label={tCommon('status.live')} />
          ) : (
            <Badge variant="muted" label={t('stream.offline')} />
          )
        }
      />

      <View className="px-4 py-4 gap-5">
        {/* Stream info bar */}
        {stats?.gameName && (
          <Card className="flex-row items-center gap-3 py-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">{t('stream.playing')}</Text>
              <Text className="text-sm font-medium text-gray-200">{stats.gameName}</Text>
            </View>
            {stats.uptime != null && (
              <View className="items-end">
                <Text className="text-xs text-gray-500">{t('stream.uptime')}</Text>
                <Text className="text-sm font-medium text-gray-200">
                  {Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Stats grid */}
        {isLoading ? (
          <View className="flex-row flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 flex-1 min-w-36 rounded-xl" />
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            <StatCard
              icon={<Users size={18} color="#a855f7" />}
              label={t('stats.viewers')}
              value={formatNumber(stats?.viewerCount ?? 0)}
              accent="#a855f7"
            />
            <StatCard
              icon={<UserPlus size={18} color="#3b82f6" />}
              label={t('stats.followers')}
              value={formatNumber(stats?.followerCount ?? 0)}
              accent="#3b82f6"
            />
            <StatCard
              icon={<Terminal size={18} color="#10b981" />}
              label={t('stats.commands')}
              value={formatNumber(stats?.commandsUsed ?? 0)}
              accent="#10b981"
            />
            <StatCard
              icon={<MessageSquare size={18} color="#f59e0b" />}
              label={t('stats.messages')}
              value={formatNumber(stats?.messagesCount ?? 0)}
              accent="#f59e0b"
            />
          </View>
        )}

        {/* Quick actions */}
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase text-gray-500 px-1">
            {t('quickAccess.title')}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Pressable
                  key={action.href}
                  onPress={() => router.push(action.href as any)}
                  className="flex-1 min-w-[140px]"
                >
                  <Card className="flex-row items-center gap-3 active:opacity-80">
                    <View
                      className="h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <Icon size={18} color={action.color} />
                    </View>
                    <Text className="flex-1 text-sm font-medium text-gray-200">
                      {tCommon(action.labelKey as any)}
                    </Text>
                    <ChevronRight size={14} color="#5a5b72" />
                  </Card>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Recent activity */}
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase text-gray-500 px-1">
            {t('activityFeed.title')}
          </Text>
          <Card className="gap-0 p-0 overflow-hidden">
            {events.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-sm text-gray-600">{t('activityFeed.empty')}</Text>
                <Text className="text-xs text-gray-700 mt-1">
                  {t('activityFeed.liveOnly')}
                </Text>
              </View>
            ) : (
              events.slice(0, 10).map((event, index) => {
                const Icon = EVENT_ICONS[event.type] ?? Zap
                const color = EVENT_COLORS[event.type] ?? '#6b7280'
                const labelKey = EVENT_LABEL_KEYS[event.type]
                const label = labelKey
                  ? t(`activityFeed.events.${labelKey}` as any)
                  : event.type
                return (
                  <View
                    key={event.id}
                    className={`flex-row items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t border-border' : ''}`}
                  >
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon size={14} color={color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-200">
                        <Text className="font-semibold">{event.displayName}</Text>
                        <Text className="text-gray-400"> {label}</Text>
                        {event.type === 'cheer' && event.data.bits != null && (
                          <Text className="text-amber-400"> {String(event.data.bits)} bits</Text>
                        )}
                        {event.type === 'raid' && event.data.viewers != null && (
                          <Text className="text-red-400"> with {String(event.data.viewers)} viewers</Text>
                        )}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">
                      {formatRelativeTime(event.timestamp)}
                    </Text>
                  </View>
                )
              })
            )}
          </Card>
        </View>
      </View>
    </ScrollView>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: string
}) {
  return (
    <Card className="flex-1 min-w-[140px] gap-2 py-4">
      <View className="flex-row items-center gap-2">
        {icon}
      </View>
      <Text className="text-2xl font-bold text-gray-100">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </Card>
  )
}
