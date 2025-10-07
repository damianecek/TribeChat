import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Channel } from 'src/types'

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref<Channel[]>([])

  function setChannels(newChannels: Channel[]) {
    channels.value = newChannels
  }

  function addChannel(channel: Channel) {
    channels.value.push(channel)
  }

  function updateChannel(id: string, newName: string) {
    const channel = channels.value.find(item => item.id === id)
    if (channel) channel.name = newName
  }

  function deleteChannel(id: string) {
    channels.value = channels.value.filter(channel => channel.id !== id)
  }

  return { channels, setChannels, addChannel, deleteChannel, updateChannel }
})
