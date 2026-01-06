import { defineStore } from 'pinia'
import { ref } from 'vue'
import { socketService } from 'src/services/SocketService'
import type { UserChannel, NotificationSetting } from 'src/types'

export const useUserChannelsStore = defineStore('userChannels', () => {
  const userChannels = ref<
    {
      id: string
      userId: number
      channelId: string
      hasUnread: boolean
      notificationSetting: NotificationSetting
    }[]
  >([])
  const invitations = ref<{ channelId: string; userId: number; invitedBy?: number }[]>([])
  const bans = ref<{ channelId: string; userId: number; isPermanent: boolean }[]>([])

  /**
   * Set user channels
   */
  function setUserChannels(newUserChannels: UserChannel[]): void {
    if (newUserChannels.length === 0) {
      userChannels.value = []
      invitations.value = []
      bans.value = []
      return
    }

    userChannels.value = newUserChannels.map((uc) => ({
      id: uc.id,
      userId: uc.userId,
      channelId: uc.channelId,
      hasUnread: false,
      notificationSetting: 'all' as NotificationSetting,
    }))

    invitations.value = invitations.value.filter(
      (inv) => !newUserChannels.some((uc) => uc.userId === inv.userId && uc.channelId === inv.channelId)
    )
  }

  /**
   * Add a user to a channel
   */
  function addUserToChannel(userId: number, channelId: string, id?: string): void {
    const exists = userChannels.value.some((uc) => uc.userId === userId && uc.channelId === channelId)
    if (!exists) {
      userChannels.value.push({
        id: id || crypto.randomUUID(),
        userId,
        channelId,
        hasUnread: false,
        notificationSetting: 'all' as NotificationSetting,
      })
    }
  }

  /**
   * Remove a user from a channel
   */
  function removeUserFromChannel(userId: number, channelId: string): void {
    userChannels.value = userChannels.value.filter(
      (uc) => !(uc.userId === userId && uc.channelId === channelId)
    )
  }

  /**
   * Add an invitation
   */
  function addInvitation(channelId: string, userId: number, invitedBy?: number): void {
    const exists = invitations.value.some(
      (inv) => inv.channelId === channelId && inv.userId === userId
    )
    if (exists) return

    const payload: { channelId: string; userId: number; invitedBy?: number } =
      invitedBy !== undefined ? { channelId, userId, invitedBy } : { channelId, userId }

    invitations.value.push(payload)
  }

  /**
   * Remove an invitation
   */
  function removeInvitation(channelId: string, userId: number): void {
    invitations.value = invitations.value.filter(
      (inv) => !(inv.channelId === channelId && inv.userId === userId)
    )
  }

  /**
   * Get invitations for a user
   */
  function getInvitationsForUser(userId: number) {
    return invitations.value.filter((inv) => inv.userId === userId)
  }

  /**
   * Add a ban
   */
  function addBan(userId: number, channelId: string, isPermanent: boolean): void {
    const exists = bans.value.some((ban) => ban.channelId === channelId && ban.userId === userId)
    if (!exists) {
      bans.value.push({ userId, channelId, isPermanent })
    }
  }

  /**
   * Set all bans
   */
  function setBans(list: { userId: number; channelId: string; isPermanent: boolean }[]): void {
    bans.value = list
  }

  /**
   * Remove a ban
   */
  function removeBan(userId: number, channelId: string): void {
    bans.value = bans.value.filter((ban) => !(ban.userId === userId && ban.channelId === channelId))
  }

  /**
   * Check if user is banned
   */
  function isBanned(userId: number, channelId: string): boolean {
    return bans.value.some((ban) => ban.userId === userId && ban.channelId === channelId)
  }

  /**
   * Mark a channel as unread
   */
  function markUnread(channelId: string, userId: number): void {
    const channel = userChannels.value.find(
      (c) => c.channelId === channelId && c.userId === userId
    )
    if (channel) {
      channel.hasUnread = true
    }
  }

  /**
   * Clear unread status
   */
  function clearUnread(channelId: string, userId: number): void {
    const channel = userChannels.value.find(
      (c) => c.channelId === channelId && c.userId === userId
    )
    if (channel) {
      channel.hasUnread = false
    }
  }

  /**
   * Change notification setting
   */
  function changeNotificationSetting(
    channelId: string,
    userId: number,
    setting: NotificationSetting
  ): void {
    const channel = userChannels.value.find(
      (c) => c.channelId === channelId && c.userId === userId
    )
    if (channel) {
      channel.notificationSetting = setting
    }
  }

  /**
   * Get notification setting
   */
  function getNotificationSetting(channelId: string, userId: number): NotificationSetting | null {
    const channel = userChannels.value.find(
      (c) => c.channelId === channelId && c.userId === userId
    )
    return channel ? channel.notificationSetting : null
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

  /**
   * Invite a user via socket
   */
  function inviteUser(userId: number, channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:invite', { userId, channelId })
  }

  /**
   * Kick a user via socket
   */
  function kickUser(targetId: number, channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:kick', { targetId, channelId })
  }

  /**
   * Accept an invitation via socket
   */
  function acceptInvite(channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:join', channelId)
  }

  /**
   * Decline an invitation via socket
   */
  function declineInvite(channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:declineInvite', channelId)
  }

  /**
   * Ban a user via socket
   */
  function banUser(targetId: number, channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:ban', { targetId, channelId })
  }

  /**
   * Vote ban a user via socket
   */
  function voteBanUser(targetId: number, channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:voteBan', { targetId, channelId })
  }

  /**
   * Unban a user via socket
   */
  function unbanUser(targetId: number, channelId: string): void {
    const socket = socketService.getSocket()
    socket?.emit('member:unban', { targetId, channelId })
  }

  return {
    userChannels,
    invitations,
    bans,
    setUserChannels,
    addUserToChannel,
    removeUserFromChannel,
    addInvitation,
    removeInvitation,
    getInvitationsForUser,
    addBan,
    removeBan,
    isBanned,
    setBans,
    joinChannel,
    leaveChannel,
    inviteUser,
    kickUser,
    acceptInvite,
    declineInvite,
    banUser,
    voteBanUser,
    unbanUser,
    markUnread,
    clearUnread,
    changeNotificationSetting,
    getNotificationSetting,
    getChannelsForUser: (userId: number) =>
      userChannels.value.filter((uc) => uc.userId === userId).map((uc) => uc.channelId),
    getUsersInChannel: (channelId: string) =>
      userChannels.value.filter((uc) => uc.channelId === channelId).map((uc) => uc.userId),
  }
})

export type UserChannelsStore = ReturnType<typeof useUserChannelsStore>
