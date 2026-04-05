import { useState, useEffect } from 'react'
import { Dimensions, Platform } from 'react-native'
import * as Device from 'expo-device'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  return 'sm'
}

export function useBreakpoint() {
  const [width, setWidth] = useState(Dimensions.get('window').width)
  const breakpoint = getBreakpoint(width)

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width)
    })
    return () => subscription.remove()
  }, [])

  const isTablet =
    Device.deviceType === Device.DeviceType.TABLET ||
    (Platform.OS !== 'web' && width >= BREAKPOINTS.md && width < BREAKPOINTS.lg)

  return {
    width,
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet,
    isDesktop: Platform.OS === 'web' || ['lg', 'xl', '2xl'].includes(breakpoint),
    isAtLeast: (bp: Breakpoint) => width >= BREAKPOINTS[bp],
  }
}
