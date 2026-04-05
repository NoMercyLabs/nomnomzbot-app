import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native'
import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Link2,
  Type,
  MessageSquareX,
  Smile,
  Trash2,
  Plus,
  Ban,
  Clock,
  Trash,
  ShieldOff,
  ShieldCheck,
} from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { useChannelStore } from '@/stores/useChannelStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { moderationApi } from '../api'
import type { AutomodConfig, ModerationBan, ModLogEntry, ModLogAction } from '../types'

// ─── Form shape wraps string arrays into objects for useFieldArray ────────────

interface DomainItem {
  value: string
}

interface PhraseItem {
  value: string
}

interface AutomodFormValues {
  linkFilter: {
    enabled: boolean
    whitelist: DomainItem[]
  }
  capsFilter: {
    enabled: boolean
    threshold: number
  }
  bannedPhrases: {
    enabled: boolean
    phrases: PhraseItem[]
  }
  emoteSpam: {
    enabled: boolean
    maxEmotes: number
  }
}

function configToForm(cfg: AutomodConfig): AutomodFormValues {
  return {
    linkFilter: {
      enabled: cfg.linkFilter.enabled,
      whitelist: cfg.linkFilter.whitelist.map((v) => ({ value: v })),
    },
    capsFilter: cfg.capsFilter,
    bannedPhrases: {
      enabled: cfg.bannedPhrases.enabled,
      phrases: cfg.bannedPhrases.phrases.map((v) => ({ value: v })),
    },
    emoteSpam: cfg.emoteSpam,
  }
}

function formToConfig(form: AutomodFormValues): AutomodConfig {
  return {
    linkFilter: {
      enabled: form.linkFilter.enabled,
      whitelist: form.linkFilter.whitelist.map((d) => d.value),
    },
    capsFilter: form.capsFilter,
    bannedPhrases: {
      enabled: form.bannedPhrases.enabled,
      phrases: form.bannedPhrases.phrases.map((p) => p.value),
    },
    emoteSpam: form.emoteSpam,
  }
}

const DEFAULT_FORM: AutomodFormValues = {
  linkFilter: { enabled: false, whitelist: [] },
  capsFilter: { enabled: false, threshold: 70 },
  bannedPhrases: { enabled: false, phrases: [] },
  emoteSpam: { enabled: false, maxEmotes: 10 },
}

// ─── AutoMod Tab ────────────────────────────────────────────────────────────

function AutoModTab() {
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const addToast = useNotificationStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery<AutomodConfig>({
    queryKey: ['channel', channelId, 'automod'],
    queryFn: () => moderationApi.getAutomodConfig(channelId!),
    enabled: !!channelId,
  })

  const { control, handleSubmit, watch } = useForm<AutomodFormValues>({
    defaultValues: DEFAULT_FORM,
    values: data ? configToForm(data) : undefined,
  })

  const { fields: whitelistFields, append: appendDomain, remove: removeDomain } =
    useFieldArray({ control, name: 'linkFilter.whitelist' })

  const { fields: phraseFields, append: appendPhrase, remove: removePhrase } =
    useFieldArray({ control, name: 'bannedPhrases.phrases' })

  const [newDomain, setNewDomain] = useState('')
  const [newPhrase, setNewPhrase] = useState('')

  const saveMutation = useMutation({
    mutationFn: (form: AutomodFormValues) =>
      moderationApi.saveAutomodConfig(channelId!, formToConfig(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'automod'] })
      addToast('success', 'AutoMod settings saved')
    },
    onError: () => addToast('error', 'Failed to save AutoMod settings'),
  })

  const linkEnabled = watch('linkFilter.enabled')
  const capsEnabled = watch('capsFilter.enabled')
  const phrasesEnabled = watch('bannedPhrases.enabled')
  const emoteEnabled = watch('emoteSpam.enabled')

  function handleAddDomain() {
    const trimmed = newDomain.trim()
    if (!trimmed) return
    appendDomain({ value: trimmed })
    setNewDomain('')
  }

  function handleAddPhrase() {
    const trimmed = newPhrase.trim()
    if (!trimmed) return
    appendPhrase({ value: trimmed })
    setNewPhrase('')
  }

  if (isLoading) {
    return (
      <View className="gap-4 p-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4 gap-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      {/* Link Filter */}
      <Card className="p-4 gap-4">
        <View className="flex-row items-center gap-3 mb-1">
          <Link2 size={18} color="#a78bfa" />
          <Text className="text-base font-semibold text-white flex-1">Link Filter</Text>
        </View>
        <Controller
          control={control}
          name="linkFilter.enabled"
          render={({ field }) => (
            <Toggle
              value={field.value}
              onValueChange={field.onChange}
              label="Block links in chat"
            />
          )}
        />
        {linkEnabled && (
          <View className="gap-3 mt-1">
            <Text className="text-sm font-medium text-gray-300">Whitelisted Domains</Text>
            {whitelistFields.map((field, i) => (
              <View key={field.id} className="flex-row items-center gap-2">
                <Controller
                  control={control}
                  name={`linkFilter.whitelist.${i}.value`}
                  render={({ field: f }) => (
                    <View className="flex-1">
                      <Input
                        value={f.value}
                        onChangeText={f.onChange}
                        placeholder="e.g. twitch.tv"
                        autoCapitalize="none"
                      />
                    </View>
                  )}
                />
                <Pressable
                  onPress={() => removeDomain(i)}
                  className="p-2 rounded-lg active:bg-surface-overlay"
                >
                  <Trash2 size={15} color="#ef4444" />
                </Pressable>
              </View>
            ))}
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <Input
                  value={newDomain}
                  onChangeText={setNewDomain}
                  placeholder="Add domain..."
                  autoCapitalize="none"
                  onSubmitEditing={handleAddDomain}
                />
              </View>
              <Button
                variant="secondary"
                size="sm"
                onPress={handleAddDomain}
                leftIcon={<Plus size={14} color="#a78bfa" />}
                label="Add"
              />
            </View>
          </View>
        )}
      </Card>

      {/* Caps Filter */}
      <Card className="p-4 gap-4">
        <View className="flex-row items-center gap-3 mb-1">
          <Type size={18} color="#f59e0b" />
          <Text className="text-base font-semibold text-white flex-1">Caps Filter</Text>
        </View>
        <Controller
          control={control}
          name="capsFilter.enabled"
          render={({ field }) => (
            <Toggle
              value={field.value}
              onValueChange={field.onChange}
              label="Block excessive caps"
            />
          )}
        />
        {capsEnabled && (
          <Controller
            control={control}
            name="capsFilter.threshold"
            render={({ field }) => (
              <View className="gap-1.5">
                <Text className="text-sm text-gray-400">
                  Block if more than{' '}
                  <Text className="text-accent-400 font-semibold">{field.value}%</Text> of message
                  is caps (0–100)
                </Text>
                <Input
                  value={String(field.value)}
                  onChangeText={(v) => {
                    const n = parseInt(v, 10)
                    if (!isNaN(n)) field.onChange(Math.min(100, Math.max(0, n)))
                  }}
                  keyboardType="numeric"
                  placeholder="70"
                />
              </View>
            )}
          />
        )}
      </Card>

      {/* Banned Phrases */}
      <Card className="p-4 gap-4">
        <View className="flex-row items-center gap-3 mb-1">
          <MessageSquareX size={18} color="#ef4444" />
          <Text className="text-base font-semibold text-white flex-1">Banned Phrases</Text>
        </View>
        <Controller
          control={control}
          name="bannedPhrases.enabled"
          render={({ field }) => (
            <Toggle
              value={field.value}
              onValueChange={field.onChange}
              label="Block banned phrases"
            />
          )}
        />
        {phrasesEnabled && (
          <View className="gap-3 mt-1">
            {phraseFields.map((field, i) => (
              <View key={field.id} className="flex-row items-center gap-2">
                <Controller
                  control={control}
                  name={`bannedPhrases.phrases.${i}.value`}
                  render={({ field: f }) => (
                    <View className="flex-1">
                      <Input value={f.value} onChangeText={f.onChange} placeholder="Phrase..." />
                    </View>
                  )}
                />
                <Pressable
                  onPress={() => removePhrase(i)}
                  className="p-2 rounded-lg active:bg-surface-overlay"
                >
                  <Trash2 size={15} color="#ef4444" />
                </Pressable>
              </View>
            ))}
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <Input
                  value={newPhrase}
                  onChangeText={setNewPhrase}
                  placeholder="Add a banned phrase..."
                  onSubmitEditing={handleAddPhrase}
                />
              </View>
              <Button
                variant="secondary"
                size="sm"
                onPress={handleAddPhrase}
                leftIcon={<Plus size={14} color="#a78bfa" />}
                label="Add"
              />
            </View>
          </View>
        )}
      </Card>

      {/* Emote Spam */}
      <Card className="p-4 gap-4">
        <View className="flex-row items-center gap-3 mb-1">
          <Smile size={18} color="#10b981" />
          <Text className="text-base font-semibold text-white flex-1">Emote Spam</Text>
        </View>
        <Controller
          control={control}
          name="emoteSpam.enabled"
          render={({ field }) => (
            <Toggle
              value={field.value}
              onValueChange={field.onChange}
              label="Block emote spam"
            />
          )}
        />
        {emoteEnabled && (
          <Controller
            control={control}
            name="emoteSpam.maxEmotes"
            render={({ field }) => (
              <Input
                label="Max emotes per message"
                value={String(field.value)}
                onChangeText={(v) => {
                  const n = parseInt(v, 10)
                  if (!isNaN(n)) field.onChange(Math.max(1, n))
                }}
                keyboardType="numeric"
                placeholder="10"
              />
            )}
          />
        )}
      </Card>

      <Button
        label="Save AutoMod Settings"
        loading={saveMutation.isPending}
        onPress={handleSubmit((form) => saveMutation.mutate(form))}
        className="mt-2"
      />
    </ScrollView>
  )
}

// ─── Bans Tab ────────────────────────────────────────────────────────────────

function BansTab() {
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const addToast = useNotificationStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const [confirmUnban, setConfirmUnban] = useState<ModerationBan | null>(null)

  const { data: bans = [], isLoading, refetch } = useQuery<ModerationBan[]>({
    queryKey: ['channel', channelId, 'moderation-bans'],
    queryFn: () => moderationApi.getModerationBans(channelId!),
    enabled: !!channelId,
  })

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => moderationApi.unbanUser(channelId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'moderation-bans'] })
      addToast('success', 'User unbanned')
      setConfirmUnban(null)
    },
    onError: () => addToast('error', 'Failed to unban user'),
  })

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-3"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </View>
        ) : bans.length === 0 ? (
          <EmptyState
            icon={<Ban size={40} color="#6b7280" />}
            title="No banned users"
            message="Banned users will appear here."
          />
        ) : (
          bans.map((ban) => (
            <Card key={ban.userId} className="p-4 gap-2">
              <View className="flex-row items-start gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-red-950">
                  <Ban size={16} color="#ef4444" />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-gray-100">{ban.username}</Text>
                  {ban.reason ? (
                    <Text className="text-xs text-gray-400" numberOfLines={2}>
                      {ban.reason}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-gray-500">
                    Banned by {ban.bannedBy} •{' '}
                    {new Date(ban.bannedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Button
                  variant="outline"
                  size="sm"
                  label="Unban"
                  onPress={() => setConfirmUnban(ban)}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <ConfirmDialog
        visible={!!confirmUnban}
        title="Unban User"
        message={`Are you sure you want to unban ${confirmUnban?.username ?? ''}?`}
        confirmLabel="Unban"
        onConfirm={() => confirmUnban && unbanMutation.mutate(confirmUnban.userId)}
        onCancel={() => setConfirmUnban(null)}
      />
    </>
  )
}

// ─── Log Tab ─────────────────────────────────────────────────────────────────

interface ActionCfg {
  label: string
  color: string
  bgColor: string
  Icon: typeof Ban
}

const ACTION_CONFIG: Record<ModLogAction, ActionCfg> = {
  ban: { label: 'Ban', color: '#ef4444', bgColor: '#450a0a', Icon: Ban },
  unban: { label: 'Unban', color: '#22c55e', bgColor: '#052e16', Icon: ShieldCheck },
  timeout: { label: 'Timeout', color: '#f97316', bgColor: '#431407', Icon: Clock },
  delete: { label: 'Delete', color: '#eab308', bgColor: '#422006', Icon: Trash },
}

function ModLogTab() {
  const channelId = useChannelStore((s) => s.currentChannel?.id)

  const { data: entries = [], isLoading, refetch } = useQuery<ModLogEntry[]>({
    queryKey: ['channel', channelId, 'moderation-log'],
    queryFn: () => moderationApi.getModerationLog(channelId!, { page: 1, take: 50 }),
    enabled: !!channelId,
  })

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4 gap-3"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      {isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </View>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<ShieldOff size={40} color="#6b7280" />}
          title="No mod log entries"
          message="Moderation actions will appear here."
        />
      ) : (
        entries.map((entry) => {
          const cfg = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.ban
          const { Icon } = cfg
          return (
            <Card key={entry.id} className="p-3">
              <View className="flex-row items-center gap-3">
                <View
                  className="h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: cfg.bgColor }}
                >
                  <Icon size={15} color={cfg.color} />
                </View>
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text style={{ color: cfg.color }} className="text-xs font-bold uppercase">
                      {cfg.label}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-200">{entry.target}</Text>
                    <Text className="text-xs text-gray-500">by {entry.moderator}</Text>
                  </View>
                  {entry.reason ? (
                    <Text className="text-xs text-gray-400" numberOfLines={1}>
                      {entry.reason}
                    </Text>
                  ) : null}
                  {entry.duration != null ? (
                    <Text className="text-xs text-gray-500">{entry.duration}s timeout</Text>
                  ) : null}
                </View>
                <Text className="text-xs text-gray-600">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </Card>
          )
        })
      )}
    </ScrollView>
  )
}

// ─── ModerationScreen ────────────────────────────────────────────────────────

export function ModerationScreen() {
  const [tab, setTab] = useState('automod')

  const tabs = [
    { key: 'automod', label: 'AutoMod' },
    { key: 'bans', label: 'Bans' },
    { key: 'log', label: 'Mod Log' },
  ]

  return (
    <View className="flex-1 bg-gray-950">
      <View className="px-4 pt-4">
        <PageHeader title="Moderation" />
      </View>
      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} className="px-2" />
      {tab === 'automod' && <AutoModTab />}
      {tab === 'bans' && <BansTab />}
      {tab === 'log' && <ModLogTab />}
    </View>
  )
}
