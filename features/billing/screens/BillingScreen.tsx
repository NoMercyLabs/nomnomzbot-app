// Billing is handled by app/(dashboard)/billing/index.tsx
import { useEffect } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'

export function BillingScreen() {
  useEffect(() => {
    router.replace('/(dashboard)/billing' as any)
  }, [])
  return <View className="flex-1 bg-gray-950" />
}
