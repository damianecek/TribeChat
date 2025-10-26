import { useChannelsStore } from 'stores/channels'
import { useTabsStore } from 'stores/tabs'
import { useUserChannelsStore } from 'stores/user_channels'
import {useUserStore} from 'stores/user'
import { useAuthStore } from 'stores/auth'

import type { Channel, User } from 'src/types'

import type { ChannelsStore } from 'stores/channels'
import type { TabsStore } from 'stores/tabs'
import type { UserChannelsStore } from 'stores/user_channels'
import type { UserStore } from 'stores/user'
import type { AuthStore } from 'stores/auth'


export function useChannelActions() {
  const channelsStore: ChannelsStore = useChannelsStore()
  const tabsStore: TabsStore = useTabsStore()
  const userChannelsStore: UserChannelsStore = useUserChannelsStore()
  const userStore: UserStore = useUserStore()
  const auth: AuthStore = useAuthStore()

  function openChannel(channel: Channel) {
    const existing = tabsStore.tabs.find(t => t.id === channel.id)
    if (existing) {
      tabsStore.setActiveTab(existing.id)
    } else {
      tabsStore.addTab({
        id: channel.id,
        label: channel.name,
        content: `Welcome to #${channel.name}!`
      })
      tabsStore.setActiveTab(channel.id)
    }
  }

  function addOrGetChannel(name: string, isPublic = true) {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Channel name required')

    // try find by exact name
    let ch: Channel | undefined = channelsStore.channels.find(c => c.name === trimmed)
    if (!ch) {
      const id = String(Date.now())
      const newChannel: Channel = {
        id,
        name: trimmed,
        is_public: isPublic,
        // ChannelMenu used boolean for user_id to indicate owner/member presence
        user_id: !!auth.user
      }
      channelsStore.addChannel(newChannel)
      ch = newChannel
    }

    if (!ch.is_public) {
      throw new Error(`Channel #${trimmed} is private`)
    }

    if (auth.user) {
      userChannelsStore.addUserToChannel(auth.user.id, ch.id)
    }

    openChannel(ch)

    return ch
  }

  function joinChannelByName(name: string) {
    return addOrGetChannel(name, true)
  }

  function cancelActiveChannel() {
    const tabsApi: TabsStore = tabsStore

    const activeId = tabsApi.activeTab
    if (!activeId) return null

    const ch: Channel | undefined = channelsStore.channels.find(c => c.id === activeId)
    if (!ch) return null

    const uid = auth.user?.id

    // remove membership if possible
    if (uid && typeof userChannelsStore.removeUserFromChannel === 'function') {
      userChannelsStore.removeUserFromChannel(uid, ch.id)
    }

    const isOwner = !!auth.user && (ch.user_id === true)

    if (isOwner) {
      channelsStore.deleteChannel(ch.id)
    }

    tabsApi.closeTab(ch.id)    

    return ch
  }

  function resolveChannelId(): string {
    const id = tabsStore.activeTab
    if (!id) throw new Error('No active channel')
    return id
  }


  function listChannelMembers(): string[] {
    const cid = resolveChannelId()

    const usersArray = userChannelsStore.getUsersInChannel(cid)

    console.log('Users in channel:', usersArray)

    if (usersArray.length === 0) {
      throw new Error('No users found in channel')
    }

    const nicknames: string[] = []
    usersArray.forEach((uid: number) => {
      const user: User | null = userStore.findUserById(uid)
      console.log('Found user:', user)
      if (user) {
        nicknames.push(user.nickname)
      }
    }
    )

    return nicknames
  }

  // invite a user (by nickname) to a channel (active tab by default)
  function inviteUserToChannel(nickname: string) {
    if (!nickname) throw new Error('User id required')
    const cid = resolveChannelId()
    
    const user: User | null = userStore.findUserByName(nickname)

    if (user === null) {
      throw new Error(`User ${nickname} not found`)
    }

    const exists = userChannelsStore.getChannelsForUser(user.id).includes(cid)

    if (exists) {
      throw new Error(`User ${nickname} is already in the channel`)
    }

    userChannelsStore.addUserToChannel(user.id, cid)
  }

  // remove (kick) a user from a channel
  function kickUserFromChannel(nickname: string) {
    if (!nickname) throw new Error('User id required')
    const cid = resolveChannelId()
    
    const user: User | null = userStore.findUserByName(nickname)

    if (user === null) {
      throw new Error(`User ${nickname} not found`)
    }

    const exists = userChannelsStore.getChannelsForUser(user.id).includes(cid)
    if (!exists) {
      throw new Error(`User ${nickname} is not in the channel`)
    }

    userChannelsStore.removeUserFromChannel(user.id, cid)
  }

  return {
    openChannel,
    addOrGetChannel,
    joinChannelByName,
    cancelActiveChannel,
    listChannelMembers,
    inviteUserToChannel,
    kickUserFromChannel

  }
}