import {
  View, Text, FlatList, TextInput, Pressable,
  KeyboardAvoidingView, Platform, Modal,
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
import { Send, X, Ban, Clock, Trash2, Shield, ChevronDown } from 'lucide-react-native'
import type { ChatMessagePayload } from '@/types/signalr'

type ChatMsg = ChatMessagePayload & { _key: string; isDeleted?: boolean }

interface UserCardProps {
  msg: ChatMsg
  onClose: () => void
  broadcasterId: string
}

function UserCard({ msg, onClose, broadcasterId }: UserCardProps) {
  const [timeoutDuration, setTimeoutDuration] = useState('60')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function doAction(action: 'ban' | 'timeout' | 'delete') {
    setLoading(action)
    try {
      if (action === 'delete') {
        await apiClient.delete(
          `/api/${broadcasterId}/chat/messages/${(msg as any).id}`,
          { data: { reason } },
        )
      } else if (action === 'ban') {
        await apiClient.post(`/api/${broadcasterId}/chat/bans`, {
          userId: msg.userId,
          reason,
        })
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

  const badgeVariant: Record<ChatMsg['userType'], 'muted' | 'success' | 'info' | 'warning' | 'danger'> = {
    viewer: 'muted',
    subscriber: 'success',
    vip: 'info',
    moderator: 'warning',
    broadcaster: 'danger',
  }

  return (
    <View className="bg-gray-900 rounded-2xl overflow-hidden" style={{ width: 300 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <View className="gap-1">
          <Text className="text-sm font-bold text-gray-100">{msg.displayName}</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-gray-500">@{msg.username}</Text>
            <Badge variant={badgeVariant[msg.userType]} label={msg.userType} />
          </View>
        </View>
        <Pressable onPress={onClose} className="p-1 rounded-lg active:bg-surface-overlay">
          <X size={18} color="#8889a0" />
        </Pressable>
      </View>

      {/* Last message */}
      <View className="px-4 py-3 border-b border-border">
        <Text className="text-xs text-gray-500 mb-1">Last message</Text>
        <Text className="text-sm text-gray-300">{msg.message}</Text>
      </View>

      {/* Mod actions */}
      <View className="px-4 py-3 gap-3">
        <Text className="text-xs font-semibold uppercase text-gray-500">Moderation</Text>

        <Input
          placeholder="Reason (optional)"
          value={reason}
          onChangeText={setReason}
        />

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

const USER_BADGE_COLORS: Record<string, string> = {
  broadcaster: '#ef4444',
  moderator: '#00ad03',
  vip: '#e005b9',
  subscriber: '#8b5cf6',
}

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
          const next = [...prev.slice(-299), { ...msg, _key: `${msg.userId}-${msg.timestamp}` }]
          return next
        })
      }
    })

    on('MessageDeleted', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._key.includes(messageId) ? { ...m, isDeleted: true } : m)),
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
        contentContainerClassName="px-4 py-2"
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
          <Pressable
            onLongPress={() => !item.isDeleted && setSelectedMsg(item)}
            className="flex-row gap-2 py-0.5"
          >
            <Text
              className="text-xs font-bold shrink-0"
              style={{ color: item.isDeleted ? '#374151' : (item.colorHex ?? '#a855f7') }}
            >
              {item.username}:
            </Text>
            {item.isDeleted ? (
              <Text className="flex-1 text-xs text-gray-700 italic">
                [message deleted]
              </Text>
            ) : (
              <Text className="flex-1 text-xs text-gray-300 leading-5">
                {item.message}
              </Text>
            )}
          </Pressable>
        )}
      />

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <Pressable
          onPress={scrollToBottom}
          className="absolute bottom-20 right-4 flex-row items-center gap-1 rounded-full bg-accent-600 px-3 py-1.5 shadow-lg"
        >
          <ChevronDown size={14} color="white" />
          <Text className="text-xs font-medium text-white">New messages</Text>
        </Pressable>
      )}

      {/* Input */}
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

      {/* User card modal */}
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
