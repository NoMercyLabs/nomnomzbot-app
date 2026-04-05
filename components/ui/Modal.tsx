import { Modal as RNModal, View, Text, Pressable, ScrollView } from 'react-native'
import { X } from 'lucide-react-native'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function Modal({ visible, onClose, title, children, size = 'md' }: ModalProps) {
  const maxWidth = size === 'sm' ? 320 : size === 'md' ? 480 : size === 'lg' ? 640 : undefined

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-4" onPress={onClose}>
        <Pressable
          className="w-full rounded-2xl bg-gray-900 border border-gray-800"
          style={{ maxWidth }}
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <View className="flex-row items-center justify-between border-b border-gray-800 px-5 py-4">
              <Text className="text-lg font-semibold text-white">{title}</Text>
              <Pressable onPress={onClose} className="rounded-lg p-1 active:bg-gray-800">
                <X size={18} color="#9ca3af" />
              </Pressable>
            </View>
          )}
          <ScrollView className="max-h-96">{children}</ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}
