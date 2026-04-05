import { createContext, useContext, useEffect, type ReactNode, createElement } from 'react'
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

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [])

  return createElement(
    AuthContext.Provider,
    { value: { isAuthenticated, isLoading, user, accessToken, login, logout } },
    children,
  )
}
