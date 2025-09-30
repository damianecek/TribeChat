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

  function removeChannel(id: string | number) {
    channels.value = channels.value.filter(c => c.id !== id)
  }

  return { channels, setChannels, addChannel, removeChannel }
})
