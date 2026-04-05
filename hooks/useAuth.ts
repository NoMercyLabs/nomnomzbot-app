import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useSegments, useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import type { User } from '@/types/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  accessToken: string | null
  login: () => Promise<void>
  logout: () => void
}

import { createContext as _createContext } from 'react'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
