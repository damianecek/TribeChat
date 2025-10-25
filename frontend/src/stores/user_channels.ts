
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserChannelsStore = defineStore('userChannels', () => {
  const userChannels = ref<{ user_id: number; channel_id: string }[]>([])

  function addUserToChannel(user_id: number, channel_id: string) {
    const exists = userChannels.value.some(
      uc => uc.user_id === user_id && uc.channel_id === channel_id
    )
    if (!exists) userChannels.value.push({ user_id, channel_id })
  }

  function removeUserFromChannel(user_id: number, channel_id: string) {
    userChannels.value = userChannels.value.filter(
      uc => !(uc.user_id === user_id && uc.channel_id === channel_id)
    )
  }

  function getChannelsForUser(user_id: number) {
    return userChannels.value.filter(uc => uc.user_id === user_id).map(uc => uc.channel_id)
  }

  return { userChannels, addUserToChannel, removeUserFromChannel, getChannelsForUser }
})
