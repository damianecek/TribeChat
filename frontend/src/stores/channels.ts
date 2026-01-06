import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Channel } from 'src/types'
import { socketService } from 'src/services/SocketService'

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref<Channel[]>([])

  /**
   * Set all channels
   */
  function setChannels(newChannels: Channel[]): void {
    channels.value = newChannels
  }

  /**
   * Add a channel to the store
   */
  function addChannel(channel: Channel): void {
    const exists = channels.value.some((c) => c.id === channel.id)
    if (!exists) channels.value.unshift(channel)
  }

  /**
   * Update a channel locally
   */
  function updateChannelLocal(id: string, newName: string, isPublic: boolean): void {
    const channel = channels.value.find((item) => item.id === id)
    if (channel) {
      channel.channelName = newName
      channel.isPublic = isPublic
    }
  }

  /**
   * Delete a channel locally
   */
  function deleteChannelLocal(id: string): void {
    channels.value = channels.value.filter((c) => c.id !== id)
  }

  /**
   * Create a channel via socket
   */
  function createChannel(name: string, isPrivate: boolean): void {
    const socket = socketService.getSocket()
    socket?.emit('channel:create', { name, isPublic: !isPrivate })
  }

  /**
   * Update a channel via socket
   */
  function updateChannel(id: string, name: string, isPrivate: boolean): void {
    const socket = socketService.getSocket()
    socket?.emit('channel:update', { id, name, isPublic: !isPrivate })
  }

  /**
   * Delete a channel via socket
   */
  function deleteChannel(id: string): void {
    const socket = socketService.getSocket()
    socket?.emit('channel:delete', id)
  }

  /**
   * Join a channel via socket
   */
  function joinChannel(channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:join', channelId)
  }

  /**
   * Leave a channel via socket
   */
  function leaveChannel(channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:leave', channelId)
  }

  return {
    channels,
    setChannels,
    addChannel,
    updateChannelLocal,
    deleteChannelLocal,
    createChannel,
    updateChannel,
    deleteChannel,
    joinChannel,
    leaveChannel,
  }
})

export type ChannelsStore = ReturnType<typeof useChannelsStore>
