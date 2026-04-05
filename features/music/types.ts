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
