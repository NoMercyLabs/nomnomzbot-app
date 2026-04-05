import { useAuth } from './useAuth'
import { useChannel } from './useChannel'
import type { Permission } from '@/types/auth'

export function usePermissions() {
  const { user } = useAuth()
  const { currentChannel } = useChannel()

  function hasPermission(permission: Permission): boolean {
    if (!user || !currentChannel) return false
    if (user.twitchId === currentChannel.twitchId) return true // Broadcaster has all perms
    if (user.isAdmin) return true // Platform admin
    return user.permissions?.includes(permission) ?? false
  }

  function requirePermission(permission: Permission): void {
    if (!hasPermission(permission)) {
      throw new Error(`Missing permission: ${permission}`)
    }
  }

  return { hasPermission, requirePermission }
}
