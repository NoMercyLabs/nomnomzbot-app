import {
  View, Text, FlatList, TextInput, Pressable,
  KeyboardAvoidingView, Platform, Modal, Image,
} from 'react-native'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useChannelStore } from '@/stores/useChannelStore'
import { useSignalR } from '@/hooks/useSignalR'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { apiClient } from '@/lib/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Send, X, Ban, Clock, Trash2, ChevronDown } from 'lucide-react-native'
import type { ChatMessagePayload, ChatFragment, ChatBadge } from '@/types/signalr'

type ChatMsg = ChatMessagePayload & { _key: string; isDeleted?: boolean }

// Twitch emote CDN
function emoteUrl(id: string, format: 'static' | 'animated' = 'static'): string {
  return `https://static-cdn.jtvnw.net/emoticons/v2/${id}/${format}/dark/1.0`
}

// Twitch badge CDN (v1 per badge id)
function badgeUrl(badgeId: string): string {
  return `https://static-cdn.jtvnw.net/badges/v1/${badgeId}/1`
}

// Known badge set → color for fallback text badges
const BADGE_COLORS: Record<string, string> = {
  broadcaster: '#ef4444',
  moderator: '#00ad03',
  vip: '#e005b9',
  subscriber: '#8b5cf6',
  staff: '#f59e0b',
  partner: '#9146FF',
}

function BadgeRow({ badges }: { badges: ChatBadge[] }) {
  if (!badges.length) return null
  return (
    <View className="flex-row items-center gap-0.5 mr-1">
      {badges.map((b) => (
        <Image
          key={`${b.setId}-${b.id}`}
          source={{ uri: badgeUrl(b.id) }}
          style={{ width: 16, height: 16 }}
          resizeMode="contain"
        />
      ))}
    </View>
  )
}

function FragmentList({
  fragments,
  isDeleted,
}: {
  fragments: ChatFragment[]
  isDeleted: boolean
}) {
  if (isDeleted) {
    return (
      <Text className="flex-1 text-xs text-gray-700 italic">[message deleted]</Text>
    )
  }

  return (
    <Text className="flex-1 text-xs text-gray-300 leading-5" style={{ flexShrink: 1 }}>
      {fragments.map((frag, i) => {
        if (frag.type === 'emote' && frag.emote) {
          return (
            <Image
              key={i}
              source={{ uri: emoteUrl(frag.emote.id, frag.emote.format) }}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          )
        }
        if (frag.type === 'mention') {
          return (
            <Text key={i} style={{ color: '#60a5fa' }}>
              {frag.text}
            </Text>
          )
        }
        if (frag.type === 'cheermote' && frag.cheermote) {
          return (
            <Text key={i} style={{ color: frag.cheermote.color ?? '#f59e0b', fontWeight: '700' }}>
              {frag.text}
            </Text>
          )
        }
        return <Text key={i}>{frag.text}</Text>
      })}
    </Text>
  )
}

function ChatMessageRow({
  msg,
  onLongPress,
}: {
  msg: ChatMsg
  onLongPress: () => void
}) {
  const nameColor = msg.color || msg.colorHex || '#a855f7'
  const isHighlighted = msg.messageType === 'channel_points_highlighted'
  const isSubOnly = msg.messageType === 'channel_points_sub_only'
  const isIntro = msg.messageType === 'user_intro'

  // Ensure we have fragments; fall back to a single text fragment
  const fragments: ChatFragment[] =
    msg.fragments?.length
      ? msg.fragments
      : [{ type: 'text', text: msg.message }]

  return (
    <Pressable
      onLongPress={() => !msg.isDeleted && onLongPress()}
      className={[
        'flex-row py-0.5 px-1 rounded',
        isHighlighted && 'bg-yellow-900/20 border-l-2 border-yellow-500',
        isSubOnly && 'bg-purple-900/20 border-l-2 border-purple-500',
        isIntro && 'bg-blue-900/20 border-l-2 border-blue-500',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <BadgeRow badges={msg.badges ?? []} />
      <Text
        className="text-xs font-bold shrink-0"
        style={{ color: msg.isDeleted ? '#374151' : nameColor }}
      >
        {msg.displayName ?? msg.username}:{' '}
      </Text>
      <FragmentList fragments={fragments} isDeleted={!!msg.isDeleted} />
    </Pressable>
  )
}

// ──── User card (mod actions) ────────────────────────────────────────────────

interface UserCardProps {
  msg: ChatMsg
  onClose: () => void
  broadcasterId: string
}

function UserCard({ msg, onClose, broadcasterId }: UserCardProps) {
  const [timeoutDuration, setTimeoutDuration] = useState('60')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const badgeVariant: Record<ChatMsg['userType'], 'muted' | 'success' | 'info' | 'warning' | 'danger'> = {
    viewer: 'muted',
    subscriber: 'success',
    vip: 'info',
    moderator: 'warning',
    broadcaster: 'danger',
  }

  async function doAction(action: 'ban' | 'timeout' | 'delete') {
    setLoading(action)
    try {
      if (action === 'delete') {
        await apiClient.delete(`/api/${broadcasterId}/chat/messages/${msg.id}`, { data: { reason } })
      } else if (action === 'ban') {
        await apiClient.post(`/api/${broadcasterId}/chat/bans`, { userId: msg.userId, reason })
      } else {
        await apiClient.post(`/api/${broadcasterId}/chat/timeouts`, {
          userId: msg.userId,
          duration: parseInt(timeoutDuration, 10) || 60,
          reason,
        })
      }
      onClose()
    } finally {
      setLoading(null)
    }
  }

  const nameColor = msg.color || msg.colorHex || '#a855f7'
  const plainText = msg.fragments?.length
    ? msg.fragments.map((f) => f.text).join('')
    : msg.message

  return (
    <View className="bg-gray-900 rounded-2xl overflow-hidden" style={{ width: 300 }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <BadgeRow badges={msg.badges ?? []} />
            <Text className="text-sm font-bold" style={{ color: nameColor }}>
              {msg.displayName ?? msg.username}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-gray-500">@{msg.username}</Text>
            <Badge variant={badgeVariant[msg.userType]} label={msg.userType} />
          </View>
        </View>
        <Pressable onPress={onClose} className="p-1 rounded-lg active:bg-surface-overlay">
          <X size={18} color="#8889a0" />
        </Pressable>
      </View>

      <View className="px-4 py-3 border-b border-border">
        <Text className="text-xs text-gray-500 mb-1">Last message</Text>
        <Text className="text-sm text-gray-300">{plainText}</Text>
      </View>

      <View className="px-4 py-3 gap-3">
        <Text className="text-xs font-semibold uppercase text-gray-500">Moderation</Text>
        <Input placeholder="Reason (optional)" value={reason} onChangeText={setReason} />
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              placeholder="Duration (sec)"
              value={timeoutDuration}
              onChangeText={setTimeoutDuration}
              keyboardType="numeric"
            />
          </View>
          <Button
            variant="secondary"
            size="sm"
            loading={loading === 'timeout'}
            onPress={() => doAction('timeout')}
            leftIcon={<Clock size={14} color="#f59e0b" />}
            label="Timeout"
          />
        </View>
        <View className="flex-row gap-2">
          <Button
            variant="danger"
            size="sm"
            loading={loading === 'ban'}
            onPress={() => doAction('ban')}
            leftIcon={<Ban size={14} color="white" />}
            label="Ban"
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="sm"
            loading={loading === 'delete'}
            onPress={() => doAction('delete')}
            leftIcon={<Trash2 size={14} color="#ef4444" />}
            label="Delete"
            className="flex-1"
          />
        </View>
      </View>
    </View>
  )
}

// ──── Main ChatScreen ────────────────────────────────────────────────────────

export function ChatScreen() {
  const { t } = useFeatureTranslation('chat')
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [selectedMsg, setSelectedMsg] = useState<ChatMsg | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const listRef = useRef<FlatList>(null)
  const { on, off, connect, invoke } = useSignalR()

  useEffect(() => {
    connect()
  }, [connect])

  useEffect(() => {
    on('ChatMessage', (msg) => {
      if (!isPaused) {
        setMessages((prev) => {
          const key = msg.id ?? `${msg.userId}-${msg.timestamp}`
          return [...prev.slice(-299), { ...msg, _key: key }]
        })
      }
    })

    on('MessageDeleted', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId || m._key.includes(messageId) ? { ...m, isDeleted: true } : m)),
      )
    })

    on('UserBanned', ({ userId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, isDeleted: true } : m)),
      )
    })

    return () => {
      off('ChatMessage')
      off('MessageDeleted')
      off('UserBanned')
    }
  }, [on, off, isPaused])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !broadcasterId) return
    setInput('')
    try {
      await invoke('SendChatMessage', broadcasterId, text)
    } catch {}
  }, [input, broadcasterId, invoke])

  const scrollToBottom = () => {
    listRef.current?.scrollToEnd({ animated: true })
    setShowScrollBtn(false)
    setIsPaused(false)
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PageHeader title={t('title') as string} />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m._key}
        className="flex-1"
        contentContainerClassName="px-2 py-2"
        onScrollBeginDrag={() => setIsPaused(true)}
        onEndReached={() => {
          setShowScrollBtn(false)
          setIsPaused(false)
        }}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-sm text-gray-600">{t('empty') as string}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ChatMessageRow msg={item} onLongPress={() => setSelectedMsg(item)} />
        )}
      />

      {showScrollBtn && (
        <Pressable
          onPress={scrollToBottom}
          className="absolute bottom-20 right-4 flex-row items-center gap-1 rounded-full bg-accent-600 px-3 py-1.5 shadow-lg"
        >
          <ChevronDown size={14} color="white" />
          <Text className="text-xs font-medium text-white">New messages</Text>
        </Pressable>
      )}

      <View className="flex-row items-center gap-2 border-t border-gray-800 px-4 py-3">
        <TextInput
          className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
          placeholder={t('placeholder') as string}
          placeholderTextColor="#4b5563"
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          className="rounded-lg bg-accent-600 p-2.5 active:bg-accent-700"
        >
          <Send size={16} color="white" />
        </Pressable>
      </View>

      <Modal
        visible={!!selectedMsg}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMsg(null)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 px-4"
          onPress={() => setSelectedMsg(null)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {selectedMsg && (
              <UserCard
                msg={selectedMsg}
                onClose={() => setSelectedMsg(null)}
                broadcasterId={broadcasterId ?? ''}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  )
}
