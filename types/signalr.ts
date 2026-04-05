import type { Channel } from './channel'

export interface ChatMessagePayload {
  channelId: string
  userId: string
  username: string
  displayName: string
  userType: 'viewer' | 'subscriber' | 'vip' | 'moderator' | 'broadcaster'
  colorHex: string
  message: string
  badges: Array<{ setId: string; id: string; info?: string }>
  fragments: Array<{ type: string; text: string; emote?: { id: string; format: string; setId: string } }>
  isCommand: boolean
  isCheer: boolean
  bitsAmount?: number
  replyToMessageId?: string
  timestamp: string
}

export interface ChannelEventPayload {
  id: string
  type: string
  broadcasterId: string
  userId?: string
  username?: string
  displayName?: string
  data: Record<string, unknown>
  timestamp: string
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  album: string
  albumArtUrl?: string
  durationMs: number
  requestedBy?: string
}

export interface MusicStatePayload {
  broadcasterId: string
  isPlaying: boolean
  volumePercent: number
  currentTrack: MusicTrack | null
  progressMs: number
  durationMs: number
  queue: MusicTrack[]
}

export interface ModActionPayload {
  broadcasterId: string
  moderatorId: string
  moderatorUsername: string
  action: 'ban' | 'unban' | 'timeout' | 'untimeout' | 'delete_message' | 'clear_chat'
  targetUserId?: string
  targetUsername?: string
  reason?: string
  durationSeconds?: number
  messageId?: string
  messageText?: string
  timestamp: string
}

export interface StreamStatusPayload {
  broadcasterId: string
  isLive: boolean
  title?: string
  gameId?: string
  gameName?: string
  tags?: string[]
  viewerCount?: number
  startedAt?: string
}

export interface AlertPayload {
  broadcasterId: string
  severity: 'info' | 'warning' | 'error'
  code: string
  message: string
  details?: Record<string, string>
  timestamp: string
}

export interface BotStatusPayload {
  status: 'running' | 'stopped' | 'error'
  message?: string
}

/**
 * Type-safe map of all SignalR hub events (DashboardHub).
 * Keys = event names sent by the server, Values = payload types.
 */
export interface SignalREventMap {
  // Dashboard Hub events
  ChatMessage: ChatMessagePayload
  ChannelEvent: ChannelEventPayload
  MusicStateChanged: MusicStatePayload
  ModAction: ModActionPayload
  StreamStatusChanged: StreamStatusPayload
  AlertTriggered: AlertPayload
  BotStatus: BotStatusPayload
  PermissionChanged: {
    broadcasterId: string
    action: 'created' | 'updated' | 'deleted'
    subjectType: 'user' | 'role'
    subjectId: string
    resourceType: string
    resourceId?: string
    permission: string
  }
  CommandExecuted: {
    broadcasterId: string
    commandName: string
    userId: string
    username: string
    userType: string
    response?: string
    success: boolean
    errorMessage?: string
    timestamp: string
  }
  RewardRedeemed: {
    broadcasterId: string
    redemptionId: string
    rewardId: string
    rewardTitle: string
    cost: number
    userId: string
    username: string
    userInput?: string
    status: 'unfulfilled' | 'fulfilled' | 'canceled'
    timestamp: string
  }

  // Legacy / simplified events (kept for backwards compat)
  ChannelUpdated: Partial<Channel>
  ChannelWentLive: { channelId: string; startedAt: string }
  ChannelWentOffline: { channelId: string }
  CommandUpdated: { id: string; name: string }
  CommandDeleted: { id: string }
  NewEvent: { id: string; channelId: string; type: string; data: Record<string, unknown>; timestamp: string }
  NowPlayingChanged: { channelId: string; track: MusicTrack | null }
  QueueUpdated: { channelId: string; queueLength: number }
  PipelineExecuted: { pipelineId: string; channelId: string; status: 'success' | 'error'; duration: number }
  MessageDeleted: { channelId: string; messageId: string; deletedBy?: string }
  UserBanned: { channelId: string; userId: string; username: string; reason?: string }
  UserTimedOut: { channelId: string; userId: string; username: string; durationSeconds: number; reason?: string }
}

export interface SignalRHubMethods {
  JoinChannel: (broadcasterId: string) => Promise<void>
  LeaveChannel: (broadcasterId: string) => Promise<void>
  SendChatMessage: (broadcasterId: string, message: string, replyToMessageId?: string) => Promise<void>
  TriggerAction: (broadcasterId: string, actionName: string, parameters?: Record<string, string>) => Promise<void>
}

// Additional events added after initial spec
declare module './signalr' {}
