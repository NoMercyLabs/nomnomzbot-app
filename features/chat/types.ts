export interface ChatMessage {
  id: string
  channelId: string
  userId: string
  username: string
  displayName: string
  userType: 'viewer' | 'subscriber' | 'vip' | 'moderator' | 'broadcaster'
  /** Hex color from Twitch (e.g. "#FF0000") */
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

export interface ChatSettings {
  slowMode: boolean
  slowModeDelay: number
  subscriberOnly: boolean
  emotesOnly: boolean
  followersOnly: boolean
  followersOnlyDuration: number
}
