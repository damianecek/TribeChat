import { boot } from 'quasar/wrappers'
import { watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useUserStore } from 'src/stores/user'
import { socketService } from 'src/services/SocketService'
import { useMessagesStore } from 'stores/messages'

export default boot(() => {
  const auth = useAuthStore()
  const userStore = useUserStore()
  const messagesStore = useMessagesStore()

  /**
   * Watch for authentication changes and manage socket connection
   */
  auth.$subscribe((_, state) => {
    const isOffline = auth.user?.status === 'Offline'

    // Connect socket when user logs in (and not offline)
    if (state.token && !socketService.isConnected() && !isOffline) {
      socketService.connect(state.token)
    }

    // Disconnect socket when user logs out
    if (!state.token && socketService.isConnected()) {
      messagesStore.cleanup()
      socketService.disconnect()
    }
  })

  /**
   * Watch for user status changes to manage socket connection
   */
  watch(
    () => userStore.currentUser?.status,
    (newStatus, oldStatus) => {
      // Reconnect when changing from Offline to any other status
      if (oldStatus === 'Offline' && newStatus !== 'Offline' && auth.token && !socketService.isConnected()) {
        socketService.connect(auth.token)
      }
      
      // Disconnect when changing to Offline
      if (newStatus === 'Offline' && socketService.isConnected()) {
        messagesStore.cleanup()
        socketService.disconnect()
      }
    }
  )

  // Initialize socket connection if token exists and user is not offline
  if (auth.token && !socketService.isConnected() && auth.user?.status !== 'Offline') {
    socketService.connect(auth.token)
  }
})

// Export socket service for use in other modules
export { socketService }
