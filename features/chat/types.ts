export interface ChatMessage {
  id: string
  userId: string
  displayName: string
  message: string
  badges: string[]
  color: string
  timestamp: string
  channelId: string
}

export interface ChatSettings {
  slowMode: boolean
  slowModeDelay: number
  subscriberOnly: boolean
  emotesOnly: boolean
  followersOnly: boolean
  followersOnlyDuration: number
}
