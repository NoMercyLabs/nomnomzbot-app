import { View, Text, FlatList, TextInput, Pressable } from 'react-native'
import { useState, useRef } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSignalR } from '@/hooks/useSignalR'
import { useChannelStore } from '@/stores/useChannelStore'
import type { SignalREventMap } from '@/types/signalr'
import { useEffect } from 'react'
import { Send } from 'lucide-react-native'

interface ChatMessage {
  id: string
  userId: string
  displayName: string
  message: string
  color?: string
  colorHex?: string
  timestamp: string
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const { on, off, invoke, status } = useSignalR()
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    if (status !== 'connected') return
    on('ChatMessage', (data: SignalREventMap['ChatMessage']) => {
      if (data.channelId !== channelId) return
      setMessages((prev) => {
        const next = [...prev, { id: crypto.randomUUID(), ...data }]
        return next.length > 200 ? next.slice(-200) : next
      })
    })
    return () => { off('ChatMessage') }
  }, [status, channelId, on, off])

  async function sendMessage() {
    if (!input.trim() || !channelId) return
    try {
      await invoke('SendChatMessage', channelId, input)
      setInput('')
    } catch {}
  }

  return (
    <View className="flex-1 bg-surface">
      <PageHeader title="Live Chat" />
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View className="py-1 flex-row gap-2">
            <Text style={{ color: item.color || item.colorHex || 'rgb(124,58,237)' }} className="font-semibold text-sm">
              {item.displayName}:
            </Text>
            <Text className="text-gray-200 text-sm flex-1">{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-gray-500">No messages yet</Text>
          </View>
        }
      />
      <View className="flex-row items-center gap-2 border-t border-border px-4 py-3">
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          placeholder="Send a message..."
          placeholderTextColor="rgb(107, 114, 128)"
          className="flex-1 rounded-lg bg-surface-raised px-4 py-3 text-gray-100"
          returnKeyType="send"
        />
        <Pressable onPress={sendMessage} className="rounded-lg bg-accent-600 p-3">
          <Send size={18} color="white" />
        </Pressable>
      </View>
    </View>
  )
}
