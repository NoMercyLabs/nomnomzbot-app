import { useEffect, type ReactNode } from 'react'
import { View } from 'react-native'
import { useThemeStore } from '@/stores/useThemeStore'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const accentColor = useThemeStore((s) => s.accentColor)
  const isDark = useThemeStore((s) => s.isDark)

  return (
    <View style={{ flex: 1 }} className={isDark ? 'dark' : ''}>
      {children}
    </View>
  )
}
