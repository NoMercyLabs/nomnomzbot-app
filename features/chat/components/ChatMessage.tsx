import { View, Text } from 'react-native'
import type { ChatMessage as ChatMessageType } from '../types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <View className="flex-row flex-wrap py-0.5 px-2">
      <Text
        style={{ color: message.colorHex || 'rgb(124, 58, 237)' }}
        className="font-semibold text-sm"
      >
        {message.displayName}
        <Text className="text-gray-400 font-normal">: </Text>
      </Text>
      <Text className="text-gray-200 text-sm flex-shrink">{message.message}</Text>
    </View>
  )
}
