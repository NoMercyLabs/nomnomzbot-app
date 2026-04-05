import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { appStorage } from '@/lib/storage'
import { apiClient } from '@/lib/api/client'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { Platform } from 'react-native'
import type { User } from '@/types/auth'

WebBrowser.maybeCompleteAuthSession()

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshTokenValue: string | null
  expiresAt: number | null
  isLoading: boolean
  isAuthenticated: boolean
  onboardingComplete: boolean
  grantedScopes: string[]
  pendingScopeUpgrade: string[] | null

  init: () => Promise<void>
  login: () => Promise<void>
  logout: () => void
  handleCallback: (params: { code?: string; state?: string; token?: string; scopes?: string }) => Promise<boolean>
  completeOnboarding: () => void
  setAuth: (data: { user: User; accessToken: string; refreshToken: string; expiresIn: number; scopes?: string[] }) => void
  refreshToken: () => Promise<void>
  setLoading: (loading: boolean) => void
  requestScopeUpgrade: (scopes: string[]) => Promise<void>
  dismissScopeUpgrade: () => void
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:7000'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshTokenValue: null,
      expiresAt: null,
      isLoading: false,
      isAuthenticated: false,
      onboardingComplete: false,
      grantedScopes: [],
      pendingScopeUpgrade: null,

      init: async () => {
        // State is rehydrated from secure storage by zustand-persist.
        // After rehydration, restore the axios header and auto-refresh if needed.
        const state = get()
        if (!state.accessToken) return
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`
        if (state.expiresAt && Date.now() > state.expiresAt - 5 * 60 * 1000) {
          await get().refreshToken()
        }
      },

      login: async () => {
        set({ isLoading: true })
        try {
          const redirectUri = makeRedirectUri({ scheme: 'nomercybot', path: 'callback' })

          if (Platform.OS === 'web') {
            const base = typeof window !== 'undefined'
              ? window.location.origin
              : API_URL
            window.location.href = `${base}/auth/twitch`
            return
          }

          const authUrl = `${API_URL}/auth/twitch?redirect_uri=${encodeURIComponent(redirectUri)}`
          await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)
          // Result handled by deep-link callback screen
        } finally {
          set({ isLoading: false })
        }
      },

      handleCallback: async ({ code, state: oauthState, token, scopes }) => {
        set({ isLoading: true })
        try {
          const redirectUri = makeRedirectUri({ scheme: 'nomercybot', path: 'callback' })

          let res: { data: { user: User; accessToken: string; refreshToken: string; expiresIn: number; scopes?: string[] } }

          if (token) {
            res = await apiClient.post('/auth/exchange', { token })
          } else if (code) {
            res = await apiClient.post('/auth/twitch/callback', {
              code,
              state: oauthState,
              redirectUri,
            })
          } else {
            return false
          }

          const grantedScopes = res.data.scopes ??
            (scopes ? scopes.split(' ') : [])

          get().setAuth({ ...res.data, scopes: grantedScopes })
          return true
        } catch {
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      completeOnboarding: () => set({ onboardingComplete: true }),

      setAuth: ({ user, accessToken, refreshToken, expiresIn, scopes }) => {
        set({
          user,
          accessToken,
          refreshTokenValue: refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
          grantedScopes: scopes ?? get().grantedScopes,
          pendingScopeUpgrade: null,
        })
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      },

      refreshToken: async () => {
        const { refreshTokenValue } = get()
        if (!refreshTokenValue) return

        set({ isLoading: true })
        try {
          const res = await apiClient.post<{
            accessToken: string
            refreshToken: string
            expiresIn: number
          }>('/auth/refresh', { refreshToken: refreshTokenValue })

          set({
            accessToken: res.data.accessToken,
            refreshTokenValue: res.data.refreshToken,
            expiresAt: Date.now() + res.data.expiresIn * 1000,
          })
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`
        } catch {
          get().logout()
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshTokenValue: null,
          expiresAt: null,
          isAuthenticated: false,
          grantedScopes: [],
          pendingScopeUpgrade: null,
        })
        delete apiClient.defaults.headers.common['Authorization']
      },

      setLoading: (loading) => set({ isLoading: loading }),

      requestScopeUpgrade: async (scopes: string[]) => {
        const { grantedScopes } = get()
        const missing = scopes.filter((s) => !grantedScopes.includes(s))
        if (missing.length === 0) return

        set({ pendingScopeUpgrade: missing })
      },

      dismissScopeUpgrade: () => set({ pendingScopeUpgrade: null }),
    }),
    {
      name: 'nomercybot-auth',
      storage: createJSONStorage(() => appStorage),
      partialState: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshTokenValue: state.refreshTokenValue,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
        onboardingComplete: state.onboardingComplete,
        grantedScopes: state.grantedScopes,
      }),
    } as any,
  ),
)
