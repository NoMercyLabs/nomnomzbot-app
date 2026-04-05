import { useEffect } from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2 } from 'lucide-react-native'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const commandSchema = z.object({
  name: z.string().min(1, 'Required').startsWith('!', 'Must start with !'),
  response: z.string().min(1, 'Required'),
  cooldown: z.number().min(0).max(86400),
  userCooldown: z.number().min(0).max(86400),
  permission: z.enum(['everyone', 'subscriber', 'vip', 'moderator', 'broadcaster']),
  enabled: z.boolean(),
})

type CommandFormData = z.infer<typeof commandSchema>

const PERMISSION_OPTIONS = [
  { label: 'Everyone', value: 'everyone' },
  { label: 'Subscriber', value: 'subscriber' },
  { label: 'VIP', value: 'vip' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Broadcaster', value: 'broadcaster' },
]

export function CommandDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>()
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const qc = useQueryClient()
  const toast = useToast()
  const isNew = name === 'new'

  const { data, isLoading } = useQuery({
    queryKey: ['commands', broadcasterId, name],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/commands/${name}`).then((r) => r.data),
    enabled: !!broadcasterId && !isNew,
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommandFormData>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      name: '',
      response: '',
      cooldown: 0,
      userCooldown: 0,
      permission: 'everyone',
      enabled: true,
    },
  })

  useEffect(() => {
    if (data) {
      reset({
        name: data.name ?? '',
        response: data.response ?? '',
        cooldown: data.cooldown ?? 0,
        userCooldown: data.userCooldown ?? 0,
        permission: data.permission ?? 'everyone',
        enabled: data.enabled ?? true,
      })
    }
  }, [data, reset])

  const saveMutation = useMutation({
    mutationFn: (values: CommandFormData) =>
      isNew
        ? apiClient.post(`/api/${broadcasterId}/commands`, values).then((r) => r.data)
        : apiClient.put(`/api/${broadcasterId}/commands/${name}`, values).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commands', broadcasterId] })
      toast.success(isNew ? 'Command created' : 'Command saved')
      router.back()
    },
    onError: () => toast.error('Failed to save command'),
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiClient.delete(`/api/${broadcasterId}/commands/${name}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commands', broadcasterId] })
      toast.success('Command deleted')
      router.back()
    },
    onError: () => toast.error('Failed to delete command'),
  })

  function confirmDelete() {
    Alert.alert('Delete Command', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ])
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950">
        <PageHeader title="Command" showBack />
        <View className="p-4 gap-3">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </View>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader
        title={isNew ? 'New Command' : name ?? 'Command'}
        showBack
        rightContent={
          <View className="flex-row gap-2">
            {!isNew && (
              <Button
                variant="ghost"
                size="sm"
                onPress={confirmDelete}
                loading={deleteMutation.isPending}
                leftIcon={<Trash2 size={14} color="#ef4444" />}
                label="Delete"
              />
            )}
            <Button
              size="sm"
              loading={saveMutation.isPending}
              onPress={handleSubmit((v) => saveMutation.mutate(v))}
              label="Save"
            />
          </View>
        }
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Command Name"
            placeholder="!command"
            value={value}
            onChangeText={onChange}
            error={errors.name?.message}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />

      <Controller
        control={control}
        name="response"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Response"
            placeholder="Bot response text..."
            value={value}
            onChangeText={onChange}
            error={errors.response?.message}
            multiline
            numberOfLines={4}
          />
        )}
      />

      <Controller
        control={control}
        name="permission"
        render={({ field: { onChange, value } }) => (
          <Select
            label="Permission"
            value={value}
            onValueChange={onChange}
            options={PERMISSION_OPTIONS}
          />
        )}
      />

      <Card className="gap-4">
        <Controller
          control={control}
          name="cooldown"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Global cooldown (seconds)"
              placeholder="0"
              value={String(value)}
              onChangeText={(v) => onChange(parseInt(v, 10) || 0)}
              keyboardType="numeric"
              error={errors.cooldown?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="userCooldown"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Per-user cooldown (seconds)"
              placeholder="0"
              value={String(value)}
              onChangeText={(v) => onChange(parseInt(v, 10) || 0)}
              keyboardType="numeric"
              error={errors.userCooldown?.message}
            />
          )}
        />
      </Card>

      <Controller
        control={control}
        name="enabled"
        render={({ field: { onChange, value } }) => (
          <Toggle
            label="Enabled"
            description="Command will respond when triggered in chat"
            value={value}
            onValueChange={onChange}
          />
        )}
      />
    </ScrollView>
  )
}
