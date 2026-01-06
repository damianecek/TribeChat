import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { useChannelSocket } from 'src/composable/useChannelSocket'
import { useMemberSocket } from 'src/composable/useMemberSocket'
import { useMessageSocket } from 'src/composable/useMessageSocket'
import { useUserSocket } from 'src/composable/useUserSocket'

/**
 * Centralized Socket Service for managing WebSocket connections and events
 */
export class SocketService {
  private socket: Socket | null = null
  private token: string | null = null

  /**
   * Connect to the WebSocket server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('⚠️ Socket already connected')
      return
    }

    if (!token) {
      console.warn('⚠️ No token provided for socket connection')
      return
    }

    console.log('🟢 Connecting socket...')
    this.token = token

    this.socket = io('http://localhost:3333', {
      auth: { token },
    })

    this.initializeEventListeners()
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (!this.socket) return

    console.log('🔴 Disconnecting socket...')
    this.cleanupEventListeners()
    this.socket.disconnect()
    this.socket = null
    this.token = null
  }

  /**
   * Get the current socket instance
   */
  getSocket(): Socket | null {
    return this.socket
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Initialize all socket event listeners using composables
   */
  private initializeEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WS connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 WS disconnected:', reason)
    })

    // Initialize domain-specific listeners using composables
    const channelSocket = useChannelSocket(this.socket)
    const memberSocket = useMemberSocket(this.socket)
    const messageSocket = useMessageSocket(this.socket)
    const userSocket = useUserSocket(this.socket)

    channelSocket.initListeners()
    memberSocket.initListeners()
    messageSocket.initListeners()
    userSocket.initListeners()
  }

  /**
   * Cleanup all socket event listeners
   */
  private cleanupEventListeners(): void {
    if (!this.socket) return

    const channelSocket = useChannelSocket(this.socket)
    const memberSocket = useMemberSocket(this.socket)
    const messageSocket = useMessageSocket(this.socket)
    const userSocket = useUserSocket(this.socket)

    channelSocket.cleanup()
    memberSocket.cleanup()
    messageSocket.cleanup()
    userSocket.cleanup()

    this.socket.off('connect')
    this.socket.off('disconnect')
  }
}

// Export a singleton instance
export const socketService = new SocketService()
