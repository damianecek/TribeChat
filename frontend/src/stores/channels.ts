import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Channel } from 'src/types'
import { socket } from 'boot/socket'

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref<Channel[]>([])

  // === Lokálne úpravy ===
  function setChannels(newChannels: Channel[]) {
    channels.value = newChannels
  }

  function addChannel(channel: Channel) {
    const exists = channels.value.some((c) => c.id === channel.id)
    if (!exists) channels.value.unshift(channel)
  }

  function updateChannelLocal(id: string, newName: string, isPublic: boolean) {
    const channel = channels.value.find((item) => item.id === id)
    if (channel) {
      channel.channelName = newName
      channel.isPublic = isPublic
    }
  }

  function deleteChannelLocal(id: string) {
    channels.value = channels.value.filter((c) => c.id !== id)
  }

  // === WebSocket akcie ===
  function createChannel(name: string, isPrivate: boolean) {
    socket?.emit('channel:create', { name, isPublic: !isPrivate })
  }

  function updateChannel(id: string, name: string, isPrivate: boolean) {
    socket?.emit('channel:update', { id, name, isPublic: !isPrivate })
  }

  function deleteChannel(id: string) {
    socket?.emit('channel:delete', id)
  }

  function joinChannel(channelId: string) {
    socket?.emit('member:join', channelId)
  }

  function leaveChannel(channelId: string) {
    socket?.emit('member:leave', channelId)
  }

  // === WS eventy ===
  if (socket) {
    socket.on('response:channels', (chs: Channel[]) => setChannels(chs))
    socket.on('channel:created', (ch: Channel) => addChannel(ch))
    socket.on('channel:updated', (ch: Channel) =>
      updateChannelLocal(ch.id, ch.channelName, ch.isPublic),
    )
    socket.on('channel:deleted', (id: string) => deleteChannelLocal(id))
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
