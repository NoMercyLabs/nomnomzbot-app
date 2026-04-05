import { useState, useEffect, useCallback } from 'react'
import { useSignalR } from '@/hooks/useSignalR'
import { useChannelStore } from '@/stores/useChannelStore'
import { MAX_CHAT_MESSAGES } from '@/lib/utils/constants'
import type { ChatMessage } from '../types'
import type { SignalREventMap } from '@/types/signalr'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const { on, off, invoke, status } = useSignalR()
  const channelId = useChannelStore((s) => s.currentChannel?.id)

  useEffect(() => {
    if (status !== 'connected') return

    on('ChatMessage', (data: SignalREventMap['ChatMessage']) => {
      if (data.channelId !== channelId) return
      setMessages((prev) => {
        const next = [...prev, { id: crypto.randomUUID(), ...data }]
        return next.length > MAX_CHAT_MESSAGES ? next.slice(-MAX_CHAT_MESSAGES) : next
      })
    })

    on('MessageDeleted', (data) => {
      if (data.channelId !== channelId) return
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId))
    })

    return () => {
      off('ChatMessage')
      off('MessageDeleted')
    }
  }, [status, channelId, on, off])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!channelId) return
      await invoke('SendChatMessage', channelId, text)
    },
    [channelId, invoke],
  )

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, sendMessage, clearMessages }
}
