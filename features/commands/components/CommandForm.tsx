import { View, Text, Pressable } from 'react-native'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react-native'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { Command, CommandCreate, CommandUpdate, PermissionLevel } from '../types'

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, hyphens only'),
    enabled: z.boolean().default(true),
    permission: z
      .enum(['everyone', 'subscriber', 'vip', 'moderator', 'broadcaster'])
      .default('everyone'),
    description: z.string().max(200).optional(),
    cooldown: z.number().min(0).max(3600).default(5),
    cooldownPerUser: z.boolean().default(false),
    aliases: z.array(z.object({ value: z.string() })).default([]),
    // Response mode
    multipleResponses: z.boolean().default(false),
    response: z.string().max(500).optional(),
    responses: z.array(z.object({ value: z.string() })).default([]),
    // Pipeline mode
    usePipeline: z.boolean().default(false),
    pipeline: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.usePipeline && !data.pipeline) {
      ctx.addIssue({ code: 'custom', path: ['pipeline'], message: 'Select a pipeline' })
    }
    if (!data.usePipeline && data.multipleResponses && data.responses.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['responses'],
        message: 'Add at least one response',
      })
    }
  })

type FormData = z.infer<typeof schema>

// ─── Constants ───────────────────────────────────────────────────────────────

const PERMISSION_OPTIONS: { label: string; value: PermissionLevel }[] = [
  { label: 'Viewer', value: 'everyone' },
  { label: 'Subscriber', value: 'subscriber' },
  { label: 'VIP', value: 'vip' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Broadcaster', value: 'broadcaster' },
]

// ─── Props ───────────────────────────────────────────────────────────────────

interface CommandFormProps {
  command?: Command
  pipelines?: { id: string; name: string }[]
  onSubmit: (data: CommandCreate | CommandUpdate) => Promise<unknown>
  isSubmitting?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CommandForm({ command, pipelines = [], onSubmit, isSubmitting }: CommandFormProps) {
  const existingResponses = command?.responses?.length
    ? command.responses.map((v) => ({ value: v }))
    : command?.response
      ? [{ value: command.response }]
      : [{ value: '' }]

  const existingAliases = (command?.aliases ?? []).map((v) => ({ value: v }))

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: command?.name ?? '',
      enabled: command?.isEnabled ?? true,
      permission: command?.permission ?? 'everyone',
      description: command?.description ?? '',
      cooldown: command?.cooldown ?? command?.cooldownSeconds ?? 5,
      cooldownPerUser: command?.cooldownPerUser ?? false,
      aliases: existingAliases,
      multipleResponses: (command?.responses?.length ?? 0) >= 1,
      response: command?.response ?? '',
      responses: existingResponses,
      usePipeline: !!command?.pipeline,
      pipeline: command?.pipeline ?? '',
    },
  })

  // Field arrays
  const aliasesArray = useFieldArray({ control, name: 'aliases' })
  const responsesArray = useFieldArray({ control, name: 'responses' })

  // Watched toggles
  const multipleResponses = watch('multipleResponses')
  const usePipeline = watch('usePipeline')

  // Pipeline options for Select
  const pipelineOptions = pipelines.map((p) => ({ label: p.name, value: p.id }))

  // Transform form data → API shape
  async function handleFormSubmit(data: FormData) {
    const payload: CommandCreate | CommandUpdate = {
      name: data.name,
      enabled: data.enabled,
      permission: data.permission,
      description: data.description ?? undefined,
      cooldown: data.cooldown,
      cooldownPerUser: data.cooldownPerUser,
      aliases: data.aliases.map((a) => a.value).filter(Boolean),
    }

    if (data.usePipeline) {
      Object.assign(payload, {
        type: 'pipeline' as const,
        pipeline: data.pipeline,
        response: undefined,
        responses: undefined,
      })
    } else if (data.multipleResponses) {
      const filtered = data.responses.map((r) => r.value).filter(Boolean)
      Object.assign(payload, {
        type: 'text' as const,
        responses: filtered,
        response: filtered[0] ?? '',
        pipeline: undefined,
      })
    } else {
      Object.assign(payload, {
        type: 'text' as const,
        response: data.response ?? '',
        responses: undefined,
        pipeline: undefined,
      })
    }

    await onSubmit(payload)
  }

  return (
    <View className="gap-4">
      {/* ── Name ── */}
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

      {/* ── Enabled ── */}
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

      {/* ── Permission ── */}
      <Controller
        control={control}
        name="permission"
        render={({ field: { onChange, value } }) => (
          <Select
            label="Permission Level"
            value={value}
            onValueChange={onChange}
            options={PERMISSION_OPTIONS}
            error={errors.permission?.message}
          />
        )}
      />

      {/* ── Cooldown ── */}
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

      {/* ── Cooldown Per User ── */}
      <Controller
        control={control}
        name="cooldownPerUser"
        render={({ field: { onChange, value } }) => (
          <Toggle
            label="Per-user Cooldown"
            description="Apply cooldown per user instead of globally"
            value={value}
            onValueChange={onChange}
          />
        )}
      />

      {/* ── Description ── */}
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

      {/* ── Aliases ── */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-300">Aliases</Text>
          <Pressable
            onPress={() => aliasesArray.append({ value: '' })}
            className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-surface-raised"
          >
            <Plus size={14} color="rgb(167, 139, 250)" />
            <Text className="text-xs text-accent-400 font-medium">Add Alias</Text>
          </Pressable>
        </View>

        {aliasesArray.fields.map((field, index) => (
          <View key={field.id} className="flex-row items-center gap-2">
            <View className="flex-1">
              <Controller
                control={control}
                name={`aliases.${index}.value`}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="!alias"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
            <Pressable
              onPress={() => aliasesArray.remove(index)}
              className="p-2 rounded-lg bg-red-900/30"
            >
              <Trash2 size={16} color="rgb(252, 165, 165)" />
            </Pressable>
          </View>
        ))}

        {aliasesArray.fields.length === 0 && (
          <Text className="text-xs text-gray-500 italic">No aliases. Tap Add Alias to create one.</Text>
        )}
      </View>

      {/* ── Pipeline Toggle ── */}
      <View className="h-px bg-border" />

      <Controller
        control={control}
        name="usePipeline"
        render={({ field: { onChange, value } }) => (
          <Toggle
            label="Use Pipeline"
            description="Route this command through a pipeline instead of a static response"
            value={value}
            onValueChange={onChange}
          />
        )}
      />

      {usePipeline ? (
        /* ── Pipeline Selector ── */
        <Controller
          control={control}
          name="pipeline"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Select Pipeline"
              value={value ?? ''}
              onValueChange={onChange}
              options={pipelineOptions}
              placeholder={pipelineOptions.length === 0 ? 'No pipelines available' : 'Choose a pipeline…'}
              error={errors.pipeline?.message}
            />
          )}
        />
      ) : (
        /* ── Response Section ── */
        <View className="gap-3">
          <Controller
            control={control}
            name="multipleResponses"
            render={({ field: { onChange, value } }) => (
              <Toggle
                label="Multiple Responses"
                description="Bot picks a random response each time"
                value={value}
                onValueChange={onChange}
              />
            )}
          />

          {multipleResponses ? (
            /* ── Multiple Response Field Array ── */
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-300">Responses</Text>
                <Pressable
                  onPress={() => responsesArray.append({ value: '' })}
                  className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-surface-raised"
                >
                  <Plus size={14} color="rgb(167, 139, 250)" />
                  <Text className="text-xs text-accent-400 font-medium">Add Response</Text>
                </Pressable>
              </View>

              {responsesArray.fields.map((field, index) => (
                <View key={field.id} className="flex-row items-start gap-2">
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name={`responses.${index}.value`}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          placeholder={`Response ${index + 1}. Use {{user}} for username`}
                          value={value}
                          onChangeText={onChange}
                          rows={3}
                        />
                      )}
                    />
                  </View>
                  <Pressable
                    onPress={() => responsesArray.remove(index)}
                    className="p-2 mt-1 rounded-lg bg-red-900/30"
                  >
                    <Trash2 size={16} color="rgb(252, 165, 165)" />
                  </Pressable>
                </View>
              ))}

              {responsesArray.fields.length === 0 && (
                <Text className={`text-xs italic ${errors.responses?.message ? 'text-red-400' : 'text-gray-500'}`}>
                  {errors.responses?.message ?? 'No responses. Tap Add Response to create one.'}
                </Text>
              )}
            </View>
          ) : (
            /* ── Single Response ── */
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
          )}
        </View>
      )}

      <View className="h-px bg-border" />

      {/* ── Submit ── */}
      <Button
        label={isSubmitting ? 'Saving…' : 'Save Command'}
        onPress={handleSubmit(handleFormSubmit)}
        loading={isSubmitting}
        className="mt-2"
      />
    </View>
  )
}
