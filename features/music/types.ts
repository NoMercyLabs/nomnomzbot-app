export interface Track {
  id: string
  title: string
  artist: string
  duration: number
  coverUrl?: string
  requestedBy?: string
}

export interface MusicQueue {
  nowPlaying: Track | null
  queue: Track[]
}

export interface NowPlaying {
  trackName: string
  artist: string
  album?: string
  imageUrl?: string
  durationMs: number
  progressMs: number
  isPlaying: boolean
  volume: number
  requestedBy?: string
  provider: string
}

export interface QueueItem {
  position: number
  trackName: string
  artist: string
  imageUrl?: string
  durationMs: number
  requestedBy?: string
}

export interface HistoryItem {
  trackName: string
  artist: string
  imageUrl?: string
  playedAt: string
  requestedBy?: string
}

export interface MusicSettings {
  provider: string
  requireSubToRequest: boolean
  allowVoteSkip: boolean
  maxQueueSize: number
  maxRequestsPerUser: number
}
