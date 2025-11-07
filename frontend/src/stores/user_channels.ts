
import { defineStore } from 'pinia'
import type { UserChannel } from 'src/types/user_channel';
import { ref } from 'vue'

export const useUserChannelsStore = defineStore('userChannels', () => {
  const userChannels = ref<{ userId: number; channelId: string }[]>([])

  function setUserChannels(newUserChannels: UserChannel[]){
    userChannels.value = newUserChannels
  }

  function addUserToChannel(userId: number, channelId: string) {
    const exists = userChannels.value.some(
      uc => uc.userId === userId && uc.channelId === channelId
    )
    if (!exists) userChannels.value.push({ userId, channelId })
  }

  function removeUserFromChannel(userId: number, channelId: string) {
    userChannels.value = userChannels.value.filter(
      uc => !(uc.userId === userId && uc.channelId === channelId)
    )
  }

  function getChannelsForUser(userId: number) {
    return userChannels.value.filter(uc => uc.userId === userId).map(uc => uc.channelId)
  }

  function getUsersInChannel(channelId: string) {
    return userChannels.value.filter(uc => uc.channelId === channelId).map(uc => uc.userId)
  }

  return { userChannels, addUserToChannel, removeUserFromChannel, getChannelsForUser, getUsersInChannel, setUserChannels }
})


export type UserChannelsStore = ReturnType<typeof useUserChannelsStore>;
