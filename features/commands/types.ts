export type PermissionLevel = 'everyone' | 'subscriber' | 'vip' | 'moderator' | 'broadcaster'

export interface Command {
  id: string
  name: string
  response: string
  cooldown: number
  enabled: boolean
  permission: PermissionLevel
  aliases: string[]
  description?: string
  usageCount?: number
  createdAt: string
  updatedAt: string
}

export interface CommandCreate {
  name: string
  response: string
  cooldown?: number
  permission?: PermissionLevel
  aliases?: string[]
  description?: string
}

export interface CommandUpdate extends Partial<CommandCreate> {
  enabled?: boolean
}
