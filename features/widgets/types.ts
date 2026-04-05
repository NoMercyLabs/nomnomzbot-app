export type WidgetType =
  | 'alert'
  | 'chat'
  | 'goal'
  | 'leaderboard'
  | 'nowplaying'
  | 'eventlist'
  | 'counter'
  | 'custom'

export interface Widget {
  id: string
  name: string
  type: WidgetType
  isEnabled: boolean
  overlayUrl?: string
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface WidgetCreate {
  name: string
  type: WidgetType
  config?: Record<string, unknown>
}

export interface WidgetUpdate extends Partial<WidgetCreate> {
  isEnabled?: boolean
}

export const WIDGET_TYPE_LABELS: Record<WidgetType, string> = {
  alert: 'Alert Overlay',
  chat: 'Chat Overlay',
  goal: 'Goal Widget',
  leaderboard: 'Leaderboard',
  nowplaying: 'Now Playing',
  eventlist: 'Event List',
  counter: 'Counter',
  custom: 'Custom HTML',
}

export const WIDGET_TYPE_DESCRIPTIONS: Record<WidgetType, string> = {
  alert: 'Animated alerts for follows, subs, and raids',
  chat: 'Styled chat overlay for your stream',
  goal: 'Sub/follower goal progress bar',
  leaderboard: 'Top chatters or gifters leaderboard',
  nowplaying: 'Currently playing song display',
  eventlist: 'Recent events ticker',
  counter: 'Adjustable numeric counter',
  custom: 'Custom HTML/CSS/JS widget',
}
