import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { Platform } from 'react-native'

let connection: HubConnection | null = null
let refCount = 0

export function getSignalRConnection(accessToken: string): HubConnection {
  if (!connection) {
    const baseUrl =
      Platform.OS === 'web'
        ? '/hubs/dashboard'
        : `${process.env.EXPO_PUBLIC_API_URL}/hubs/dashboard`

    connection = new HubConnectionBuilder()
      .withUrl(baseUrl, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.elapsedMilliseconds > 120_000) return null
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30_000)
        },
      })
      .configureLogging(__DEV__ ? LogLevel.Information : LogLevel.Warning)
      .build()
  }

  return connection
}

export function incrementRefCount(): void {
  refCount++
}

export function decrementRefCount(): void {
  refCount = Math.max(0, refCount - 1)
}

export function getRefCount(): number {
  return refCount
}

export async function destroyConnection(): Promise<void> {
  if (connection) {
    await connection.stop()
    connection = null
    refCount = 0
  }
}

export function getConnectionState(): HubConnectionState {
  return connection?.state ?? HubConnectionState.Disconnected
}
