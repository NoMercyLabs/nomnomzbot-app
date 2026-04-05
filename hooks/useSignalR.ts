import { useEffect, useRef, useState, useCallback } from 'react'
import { HubConnectionState, type HubConnection } from '@microsoft/signalr'
import { AppState, Platform } from 'react-native'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  getSignalRConnection,
  incrementRefCount,
  decrementRefCount,
  getRefCount,
  destroyConnection,
} from '@/lib/signalr/connection'
import type { SignalREventMap } from '@/types/signalr'
import type { ConnectionStatus } from '@/lib/signalr/types'

let statusListeners = new Set<(status: ConnectionStatus) => void>()
let currentChannelRef: string | null = null

function broadcastStatus(status: ConnectionStatus) {
  statusListeners.forEach((fn) => fn(status))
}

export function useSignalR() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    statusListeners.add(setStatus)
    return () => { statusListeners.delete(setStatus) }
  }, [])

  const connect = useCallback(async () => {
    if (!accessToken) return

    const conn = getSignalRConnection(accessToken)
    incrementRefCount()

    conn.onreconnecting(() => broadcastStatus('reconnecting'))
    conn.onreconnected(() => broadcastStatus('connected'))
    conn.onclose(() => broadcastStatus('disconnected'))

    if (conn.state === HubConnectionState.Disconnected) {
      broadcastStatus('connecting')
      try {
        await conn.start()
        broadcastStatus('connected')
      } catch (e) {
        broadcastStatus('disconnected')
        setError((e as Error).message)
      }
    } else if (conn.state === HubConnectionState.Connected) {
      broadcastStatus('connected')
    }
  }, [accessToken])

  const disconnect = useCallback(async () => {
    decrementRefCount()
    if (getRefCount() <= 0) {
      await destroyConnection()
      broadcastStatus('disconnected')
    }
  }, [])

  const on = useCallback(<K extends keyof SignalREventMap>(
    event: K,
    handler: (data: SignalREventMap[K]) => void,
  ) => {
    if (!accessToken) return
    const conn = getSignalRConnection(accessToken)
    conn.on(event as string, handler)
  }, [accessToken])

  const off = useCallback(<K extends keyof SignalREventMap>(event: K) => {
    if (!accessToken) return
    const conn = getSignalRConnection(accessToken)
    conn.off(event as string)
  }, [accessToken])

  const invoke = useCallback(async <T>(method: string, ...args: unknown[]): Promise<T> => {
    if (!accessToken) throw new Error('Not authenticated')
    const conn = getSignalRConnection(accessToken)
    if (conn.state !== HubConnectionState.Connected) {
      throw new Error('SignalR not connected')
    }
    return conn.invoke<T>(method, ...args)
  }, [accessToken])

  // Handle app foreground/background on mobile
  useEffect(() => {
    if (Platform.OS === 'web') return

    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (!accessToken) return
      const conn = getSignalRConnection(accessToken)

      if (nextState === 'active' && conn.state === HubConnectionState.Disconnected) {
        broadcastStatus('connecting')
        try {
          await conn.start()
          broadcastStatus('connected')
          if (currentChannelRef) {
            await conn.invoke('JoinChannel', currentChannelRef)
          }
        } catch (e) {
          setError((e as Error).message)
        }
      }
    })

    return () => subscription.remove()
  }, [accessToken])

  useEffect(() => {
    return () => { disconnect() }
  }, [disconnect])

  return { status, error, connect, disconnect, on, off, invoke }
}
