import { useState } from 'react'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { useAuthStore } from '@/stores/useAuthStore'
import { exchangeToken } from '../api'

export function useTwitchOAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)

  async function login() {
    setIsLoading(true)
    setError(null)
    try {
      if (Platform.OS === 'web') {
        const base = typeof window !== 'undefined'
          ? window.location.origin
          : (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000')
        window.location.href = `${base}/auth/twitch`
        return
      }

      const result = await WebBrowser.openAuthSessionAsync(
        `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000'}/auth/twitch`,
        'nomercybot://callback',
      )

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url)
        const token = url.searchParams.get('token')
        if (token) {
          const authData = await exchangeToken(token)
          setAuth(authData)
        }
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
