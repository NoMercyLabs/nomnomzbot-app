import { View, Text, Pressable } from 'react-native'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Edit, Trash2 } from 'lucide-react-native'
import type { Command } from '../types'

interface CommandCardProps {
  command: Command
  onEdit: () => void
  onDelete: () => void
}

export function CommandCard({ command, onEdit, onDelete }: CommandCardProps) {
  return (
    <Card className="flex-row items-center justify-between p-4">
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-100 font-medium">!{command.name}</Text>
          {!command.enabled && <Badge label="Disabled" variant="secondary" />}
          <Badge label={command.permission} variant="default" />
        </View>
        <Text className="text-gray-400 text-sm" numberOfLines={1}>{command.response}</Text>
        <Text className="text-gray-600 text-xs">Cooldown: {command.cooldown}s</Text>
      </View>
      <View className="flex-row gap-1">
        <Pressable onPress={onEdit} className="p-2 rounded-lg active:bg-surface-overlay">
          <Edit size={16} color="rgb(156,163,175)" />
        </Pressable>
        <Pressable onPress={onDelete} className="p-2 rounded-lg active:bg-surface-overlay">
          <Trash2 size={16} color="rgb(239,68,68)" />
        </Pressable>
      </View>
    </Card>
  )
}
