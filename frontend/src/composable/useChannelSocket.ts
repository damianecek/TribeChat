import type { Socket } from 'socket.io-client'
import { useChannelsStore } from 'stores/channels'
import { useUserChannelsStore } from 'stores/user_channels'
import { useAuthStore } from 'stores/auth'
import type { Channel } from 'src/types'

/**
 * Composable for managing channel-related socket events
 */
export function useChannelSocket(socket: Socket | null) {
  const channelsStore = useChannelsStore()
  const userChannelsStore = useUserChannelsStore()
  const authStore = useAuthStore()

  /**
   * Initialize channel socket listeners
   */
  function initListeners(): void {
    if (!socket) return

    // Request all channels on connection
    socket.on('connect', () => {
      socket.emit('request:channels')
    })

    // Channel list response
    socket.on('response:channels', (channels: Channel[]) => {
      channelsStore.setChannels(channels)
    })

    // Channel created
    socket.on('channel:created', (channel: Channel) => {
      console.log('🆕 Channel created via WS:', channel.channelName)
      channelsStore.addChannel(channel)
      if (authStore.user && channel.adminId === authStore.user.id) {
        userChannelsStore.addUserToChannel(authStore.user.id, channel.id)
      }
    })

    // Channel updated
    socket.on('channel:updated', (channel: Channel) => {
      channelsStore.updateChannelLocal(channel.id, channel.channelName, channel.isPublic)
    })

    // Channel deleted
    socket.on('channel:deleted', (id: string) => {
      channelsStore.deleteChannelLocal(id)
    })

    // Error handling
    socket.on('error:channel', (payload: { message: string }) => {
      console.warn('⚠️ Channel error:', payload.message)
    })
  }

  /**
   * Cleanup channel socket listeners
   */
  function cleanup(): void {
    if (!socket) return

    socket.off('response:channels')
    socket.off('channel:created')
    socket.off('channel:updated')
    socket.off('channel:deleted')
    socket.off('error:channel')
  }

  return {
    initListeners,
    cleanup,
  }
}
