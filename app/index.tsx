import { Redirect } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return <Redirect href={isAuthenticated ? '/(dashboard)' : '/(auth)/login'} />
}
