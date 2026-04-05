import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { useChannelStore } from '@/stores/useChannelStore'
import { useSignalR } from '@/hooks/useSignalR'
import { useFeatureTranslation } from '@/hooks/useFeatureTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Send } from 'lucide-react-native'
import type { ChatMessagePayload } from '@/types/signalr'

export function ChatScreen() {
  const { t } = useFeatureTranslation('chat')
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const [messages, setMessages] = useState<(ChatMessagePayload & { _key: string })[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<FlatList>(null)
  const { on, off, connect } = useSignalR()

  useEffect(() => {
    connect()
  }, [connect])

  useEffect(() => {
    on('ChatMessage', (msg) => {
      setMessages((prev) => [...prev.slice(-199), { ...msg, _key: `${msg.userId}-${msg.timestamp}` }])
      listRef.current?.scrollToEnd({ animated: true })
    })
    return () => { off('ChatMessage') }
  }, [on, off])

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="px-4 pt-4">
        <PageHeader title={t('title')} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m._key}
        className="flex-1"
        contentContainerClassName="px-4 py-2 gap-0.5"
        ListEmptyComponent={
          <Text className="text-center text-gray-600 py-8">{t('empty')}</Text>
        }
        renderItem={({ item }) => (
          <View className="flex-row gap-2 py-1">
            <Text className="text-xs font-semibold" style={{ color: item.colorHex ?? '#a855f7' }}>
              {item.username}
            </Text>
            <Text className="flex-1 text-xs text-gray-300">{item.message}</Text>
          </View>
        )}
      />

      <View className="flex-row items-center gap-2 border-t border-gray-800 px-4 py-3">
        <TextInput
          className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
          placeholder={t('placeholder')}
          placeholderTextColor="#4b5563"
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          onSubmitEditing={() => setInput('')}
        />
        <Pressable
          onPress={() => setInput('')}
          className="rounded-lg bg-accent-500 p-2.5 active:bg-accent-600"
        >
          <Send size={16} color="white" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
