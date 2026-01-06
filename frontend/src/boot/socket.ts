import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'
import { socketService } from 'src/services/SocketService'
import { useMessagesStore } from 'stores/messages'

export default boot(() => {
  const auth = useAuthStore()
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

    // Disconnect socket when user logs out or goes offline
    if ((!state.token || isOffline) && socketService.isConnected()) {
      messagesStore.cleanup()
      socketService.disconnect()
    }
  })

  // Initialize socket connection if token exists and user is not offline
  if (auth.token && !socketService.isConnected() && auth.user?.status !== 'Offline') {
    socketService.connect(auth.token)
  }
})

// Export socket service for use in other modules
export { socketService }
