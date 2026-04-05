import { Modal, View, Text, Pressable } from 'react-native'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60 p-6">
        <View className="w-full max-w-sm rounded-2xl bg-surface-raised p-6 gap-4">
          <View className="gap-2">
            <Text className="text-lg font-bold text-gray-100">{title}</Text>
            <Text className="text-gray-400">{message}</Text>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 rounded-xl border border-border py-3 items-center"
            >
              <Text className="text-gray-300 font-medium">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 rounded-xl py-3 items-center ${variant === 'danger' ? 'bg-red-700' : 'bg-accent-600'}`}
            >
              <Text className="text-white font-medium">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
