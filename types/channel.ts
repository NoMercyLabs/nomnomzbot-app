export interface Channel {
  id: string
  /** Twitch broadcaster ID — alias for twitchId */
  broadcasterId: string
  twitchId: string
  login: string
  displayName: string
  profileImageUrl: string
  isLive: boolean
  viewerCount: number
  title?: string
  gameName?: string
  startedAt?: string
  overlayToken: string
  botEnabled: boolean
  createdAt: string
}

export interface ChannelConfig {
  prefix: string
  locale: string
  ttsEnabled: boolean
  moderationEnabled: boolean
  loyaltyEnabled: boolean
}
