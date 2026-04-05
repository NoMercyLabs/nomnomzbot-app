import { View, TextInput, Pressable } from 'react-native'
import { useState, useCallback } from 'react'
import { Send } from 'lucide-react-native'

interface ChatInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSend = useCallback(async () => {
    const text = value.trim()
    if (!text || disabled) return
    setValue('')
    await onSend(text)
  }, [value, disabled, onSend])

  return (
    <View className="flex-row items-center gap-2 border-t border-border px-4 py-3">
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSend}
        placeholder="Send a message..."
        placeholderTextColor="rgb(107, 114, 128)"
        className="flex-1 rounded-lg bg-surface-raised px-4 py-3 text-gray-100"
        returnKeyType="send"
        editable={!disabled}
      />
      <Pressable
        onPress={handleSend}
        disabled={disabled || !value.trim()}
        className="rounded-lg bg-accent-600 p-3 disabled:opacity-50"
      >
        <Send size={18} color="white" />
      </Pressable>
    </View>
  )
}
