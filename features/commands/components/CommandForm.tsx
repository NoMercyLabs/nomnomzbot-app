import { View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import type { Command, CommandCreate, CommandUpdate } from '../types'

const schema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, hyphens only'),
  response: z.string().min(1).max(500),
  cooldown: z.number().min(0).max(3600).default(5),
  permission: z.enum(['everyone', 'subscriber', 'vip', 'moderator', 'broadcaster']).default('everyone'),
  enabled: z.boolean().default(true),
  description: z.string().max(200).optional(),
})

type FormData = z.infer<typeof schema>

interface CommandFormProps {
  command?: Command
  onSubmit: (data: CommandCreate | CommandUpdate) => Promise<unknown>
  isSubmitting?: boolean
}

export function CommandForm({ command, onSubmit, isSubmitting }: CommandFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: command?.name ?? '',
      response: command?.response ?? '',
      cooldown: command?.cooldown ?? 5,
      permission: command?.permission ?? 'everyone',
      enabled: command?.enabled ?? true,
      description: command?.description ?? '',
    },
  })

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Command Name"
            placeholder="e.g. socials"
            value={value}
            onChangeText={onChange}
            error={errors.name?.message}
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="response"
        render={({ field: { onChange, value } }) => (
          <Textarea
            label="Response"
            placeholder="What should the bot say? Use {{user}} for username"
            value={value}
            onChangeText={onChange}
            error={errors.response?.message}
            rows={4}
          />
        )}
      />

      <Controller
        control={control}
        name="cooldown"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Cooldown (seconds)"
            placeholder="5"
            value={String(value)}
            onChangeText={(v) => onChange(parseInt(v, 10) || 0)}
            keyboardType="numeric"
            error={errors.cooldown?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Description (optional)"
            placeholder="Internal note about this command"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="enabled"
        render={({ field: { onChange, value } }) => (
          <Toggle
            label="Enabled"
            description="Command will respond in chat"
            value={value}
            onValueChange={onChange}
          />
        )}
      />

      <Button
        label={isSubmitting ? 'Saving...' : 'Save Command'}
        onPress={handleSubmit(onSubmit as any)}
        loading={isSubmitting}
        className="mt-2"
      />
    </View>
  )
}
