import type { NodeCategory } from '@/types/pipeline'

interface NodeDefinition {
  type: string
  label: string
  category: NodeCategory
  description: string
  defaultConfig: Record<string, unknown>
  configSchema: Record<string, unknown>
}

export const NODE_REGISTRY: NodeDefinition[] = [
  // Triggers
  {
    type: 'trigger.chat_message',
    label: 'Chat Message',
    category: 'trigger',
    description: 'Fires when a chat message is received',
    defaultConfig: { pattern: '' },
    configSchema: { pattern: { type: 'string', label: 'Message Pattern (regex)' } },
  },
  {
    type: 'trigger.channel_point',
    label: 'Channel Point Redemption',
    category: 'trigger',
    description: 'Fires when a viewer redeems a channel point reward',
    defaultConfig: { rewardId: '' },
    configSchema: { rewardId: { type: 'string', label: 'Reward ID', required: true } },
  },
  {
    type: 'trigger.follow',
    label: 'New Follow',
    category: 'trigger',
    description: 'Fires when someone follows the channel',
    defaultConfig: {},
    configSchema: {},
  },
  {
    type: 'trigger.subscription',
    label: 'Subscription',
    category: 'trigger',
    description: 'Fires when someone subscribes or resubscribes',
    defaultConfig: { includeResub: true, includeGift: true },
    configSchema: {
      includeResub: { type: 'boolean', label: 'Include Resubs' },
      includeGift: { type: 'boolean', label: 'Include Gift Subs' },
    },
  },
  {
    type: 'trigger.raid',
    label: 'Raid',
    category: 'trigger',
    description: 'Fires when the channel is raided',
    defaultConfig: { minViewers: 0 },
    configSchema: { minViewers: { type: 'number', label: 'Minimum Viewers' } },
  },
  {
    type: 'trigger.bits',
    label: 'Bits',
    category: 'trigger',
    description: 'Fires when someone cheers with bits',
    defaultConfig: { minBits: 1 },
    configSchema: { minBits: { type: 'number', label: 'Minimum Bits' } },
  },

  // Conditions
  {
    type: 'condition.user_level',
    label: 'User Level Check',
    category: 'condition',
    description: 'Checks if the user meets a minimum permission level',
    defaultConfig: { level: 'everyone' },
    configSchema: { level: { type: 'select', label: 'Minimum Level', required: true } },
  },
  {
    type: 'condition.cooldown',
    label: 'Cooldown',
    category: 'condition',
    description: 'Only proceeds if the cooldown has elapsed',
    defaultConfig: { seconds: 30 },
    configSchema: { seconds: { type: 'number', label: 'Cooldown (seconds)', required: true } },
  },

  // Actions
  {
    type: 'action.chat_message',
    label: 'Send Chat Message',
    category: 'action',
    description: 'Sends a message in chat',
    defaultConfig: { message: '' },
    configSchema: { message: { type: 'textarea', label: 'Message', required: true } },
  },
  {
    type: 'action.timeout',
    label: 'Timeout User',
    category: 'action',
    description: 'Times out the triggering user',
    defaultConfig: { duration: 60, reason: '' },
    configSchema: {
      duration: { type: 'number', label: 'Duration (seconds)', required: true },
      reason: { type: 'string', label: 'Reason' },
    },
  },
  {
    type: 'action.add_points',
    label: 'Add Channel Points',
    category: 'action',
    description: 'Adds channel points to a user',
    defaultConfig: { amount: 100 },
    configSchema: { amount: { type: 'number', label: 'Points Amount', required: true } },
  },
  {
    type: 'action.play_music',
    label: 'Play Song Request',
    category: 'action',
    description: 'Adds a song to the music queue',
    defaultConfig: {},
    configSchema: {},
  },
  {
    type: 'action.http_request',
    label: 'HTTP Request',
    category: 'action',
    description: 'Makes an HTTP request to a URL',
    defaultConfig: { url: '', method: 'POST', body: '' },
    configSchema: {
      url: { type: 'string', label: 'URL', required: true },
      method: { type: 'select', label: 'Method' },
      body: { type: 'textarea', label: 'Body (JSON)' },
    },
  },
]

export function getNodeDef(type: string): NodeDefinition | undefined {
  return NODE_REGISTRY.find((n) => n.type === type)
}

export const NODES_BY_CATEGORY = {
  trigger: NODE_REGISTRY.filter((n) => n.category === 'trigger'),
  condition: NODE_REGISTRY.filter((n) => n.category === 'condition'),
  action: NODE_REGISTRY.filter((n) => n.category === 'action'),
}
