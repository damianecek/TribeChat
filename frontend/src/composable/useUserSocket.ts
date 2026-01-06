import type { Socket } from 'socket.io-client'
import { useUserStore } from 'stores/user'
import { useAuthStore } from 'stores/auth'
import type { UserStatus } from 'src/types'

/**
 * Composable for managing user-related socket events
 */
export function useUserSocket(socket: Socket | null) {
  const userStore = useUserStore()
  const authStore = useAuthStore()

  /**
   * Initialize user socket listeners
   */
  function initListeners(): void {
    if (!socket) return

    // User status changed
    socket.on('user:status', ({ userId, status }: { userId: number; status: UserStatus }) => {
      userStore.updateUserStatus(userId, status)
      if (userStore.currentUser?.id === userId) {
        userStore.setCurrentUserStatus(status)
      }
      if (authStore.user?.id === userId) {
        authStore.user.status = status
      }
    })

    // User created
    socket.on('user:created', (user) => {
      userStore.addUser(user)
    })
  }

  /**
   * Cleanup user socket listeners
   */
  function cleanup(): void {
    if (!socket) return

    socket.off('user:status')
    socket.off('user:created')
  }

  return {
    initListeners,
    cleanup,
  }
}
