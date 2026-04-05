import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { appStorage } from '@/lib/storage'
import { apiClient } from '@/lib/api/client'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshTokenValue: string | null
  expiresAt: number | null
  isLoading: boolean

  isAuthenticated: () => boolean
  isTokenExpiringSoon: () => boolean

  setAuth: (data: { user: User; accessToken: string; refreshToken: string; expiresIn: number }) => void
  refreshToken: () => Promise<void>
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshTokenValue: null,
      expiresAt: null,
      isLoading: false,

      isAuthenticated: () => {
        const { accessToken, user } = get()
        return !!accessToken && !!user
      },

      isTokenExpiringSoon: () => {
        const { expiresAt } = get()
        if (!expiresAt) return false
        return Date.now() > expiresAt - 5 * 60 * 1000
      },

      setAuth: ({ user, accessToken, refreshToken, expiresIn }) => {
        set({
          user,
          accessToken,
          refreshTokenValue: refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
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
          }>('/v1/auth/refresh', { refreshToken: refreshTokenValue })

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
        })
        delete apiClient.defaults.headers.common['Authorization']
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'nomercybot-auth',
      storage: createJSONStorage(() => appStorage),
      partialState: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshTokenValue: state.refreshTokenValue,
        expiresAt: state.expiresAt,
      }),
    } as any,
  ),
)
