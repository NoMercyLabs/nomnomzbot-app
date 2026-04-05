import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'

// Dynamic token getter — updated by useSignalR after auth changes.
// Using a getter avoids stale tokens on refresh without recreating the connection.
let _getToken: (() => string) | null = null

export function setSignalRTokenGetter(getter: () => string): void {
  _getToken = getter
}

function makeBaseUrl(hubPath: string): string {
  return `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5080'}${hubPath}`
}

function buildConnection(hubPath: string): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(makeBaseUrl(hubPath), {
      accessTokenFactory: () => _getToken?.() ?? '',
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        if (retryContext.elapsedMilliseconds > 120_000) return null
        return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30_000)
      },
    })
    .configureLogging(__DEV__ ? LogLevel.Warning : LogLevel.Error)
    .build()
}

// ── DashboardHub (/hubs/dashboard) ───────────────────────────────────────────

let dashboardConnection: HubConnection | null = null
let dashboardRefCount = 0

export function getDashboardConnection(): HubConnection {
  if (!dashboardConnection) {
    dashboardConnection = buildConnection('/hubs/dashboard')
  }
  return dashboardConnection
}

export function incrementDashboardRefCount(): void {
  dashboardRefCount++
}

export function decrementDashboardRefCount(): void {
  dashboardRefCount = Math.max(0, dashboardRefCount - 1)
}

export function getDashboardRefCount(): number {
  return dashboardRefCount
}

export async function destroyDashboardConnection(): Promise<void> {
  if (dashboardConnection) {
    await dashboardConnection.stop()
    dashboardConnection = null
    dashboardRefCount = 0
  }
}

// ── OverlayHub (/hubs/overlay) ────────────────────────────────────────────────

let overlayConnection: HubConnection | null = null
let overlayRefCount = 0

export function getOverlayConnection(): HubConnection {
  if (!overlayConnection) {
    overlayConnection = buildConnection('/hubs/overlay')
  }
  return overlayConnection
}

export function incrementOverlayRefCount(): void {
  overlayRefCount++
}

export function decrementOverlayRefCount(): void {
  overlayRefCount = Math.max(0, overlayRefCount - 1)
}

export function getOverlayRefCount(): number {
  return overlayRefCount
}

export async function destroyOverlayConnection(): Promise<void> {
  if (overlayConnection) {
    await overlayConnection.stop()
    overlayConnection = null
    overlayRefCount = 0
  }
}

// ── OBSRelayHub (/hubs/obs-relay) ────────────────────────────────────────────

let obsConnection: HubConnection | null = null
let obsRefCount = 0

export function getOBSConnection(): HubConnection {
  if (!obsConnection) {
    obsConnection = buildConnection('/hubs/obs-relay')
  }
  return obsConnection
}

export function incrementOBSRefCount(): void {
  obsRefCount++
}

export function decrementOBSRefCount(): void {
  obsRefCount = Math.max(0, obsRefCount - 1)
}

export function getOBSRefCount(): number {
  return obsRefCount
}

export async function destroyOBSConnection(): Promise<void> {
  if (obsConnection) {
    await obsConnection.stop()
    obsConnection = null
    obsRefCount = 0
  }
}

// ── Shared utilities ──────────────────────────────────────────────────────────

/** Destroy all hub connections (called on logout). */
export async function destroyAllConnections(): Promise<void> {
  await Promise.allSettled([
    destroyDashboardConnection(),
    destroyOverlayConnection(),
    destroyOBSConnection(),
  ])
}

export function getConnectionState(connection: HubConnection | null): HubConnectionState {
  return connection?.state ?? HubConnectionState.Disconnected
}

// ── Backwards-compat aliases (used by existing useSignalR hook) ───────────────

/** @deprecated Use getDashboardConnection() */
export function getSignalRConnection(_token?: string): HubConnection {
  return getDashboardConnection()
}

/** @deprecated Use incrementDashboardRefCount() */
export const incrementRefCount = incrementDashboardRefCount

/** @deprecated Use decrementDashboardRefCount() */
export const decrementRefCount = decrementDashboardRefCount

/** @deprecated Use getDashboardRefCount() */
export const getRefCount = getDashboardRefCount

/** @deprecated Use destroyDashboardConnection() */
export const destroyConnection = destroyDashboardConnection
