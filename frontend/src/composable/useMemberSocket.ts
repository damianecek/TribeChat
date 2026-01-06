import type { Socket } from 'socket.io-client'
import { useUserChannelsStore } from 'stores/user_channels'
import { useAuthStore } from 'stores/auth'

/**
 * Composable for managing member-related socket events
 */
export function useMemberSocket(socket: Socket | null) {
  const userChannelsStore = useUserChannelsStore()
  const authStore = useAuthStore()

  /**
   * Initialize member socket listeners
   */
  function initListeners(): void {
    if (!socket) return

    // Member joined
    socket.on(
      'member:joined',
      ({ userId, channelId, id }: { userId: number; channelId: string; id: string }) => {
        console.log(`🟢 member:joined user:${userId} -> channel:${channelId}`)
        userChannelsStore.addUserToChannel(userId, channelId, id)
        if (authStore.user && userId === authStore.user.id) {
          userChannelsStore.removeInvitation(channelId, userId)
        }
      }
    )

    // Member left
    socket.on('member:left', ({ userId, channelId }: { userId: number; channelId: string }) => {
      console.log(`🔵 member:left user:${userId} <- channel:${channelId}`)
      userChannelsStore.removeUserFromChannel(userId, channelId)
    })

    // Member invited
    socket.on(
      'member:invited',
      ({
        userId,
        channelId,
        invitedBy,
      }: {
        userId: number
        channelId: string
        invitedBy?: number
      }) => {
        if (authStore.user?.id !== userId) return
        console.log(`🟢 member:invited user:${userId} -> channel:${channelId}`)
        userChannelsStore.addInvitation(channelId, userId, invitedBy)
      }
    )

    // Member kicked
    socket.on('member:kicked', ({ userId, channelId }: { userId: number; channelId: string }) => {
      console.log(`🔴 member:kicked user:${userId} from channel:${channelId}`)
      userChannelsStore.removeUserFromChannel(userId, channelId)
    })

    // Member banned
    socket.on(
      'member:banned',
      ({
        userId,
        channelId,
        isPermanent,
      }: {
        userId: number
        channelId: string
        isPermanent: boolean
      }) => {
        console.log(`⛔ member:banned user:${userId} from channel:${channelId}`)
        userChannelsStore.removeUserFromChannel(userId, channelId)
        userChannelsStore.addBan(userId, channelId, isPermanent)
        if (authStore.user && userId === authStore.user.id) {
          userChannelsStore.removeInvitation(channelId, userId)
        }
      }
    )

    // Member unbanned
    socket.on(
      'member:unbanned',
      ({ userId, channelId }: { userId: number; channelId: string }) => {
        console.log(`✅ member:unbanned user:${userId} from channel:${channelId}`)
        userChannelsStore.removeBan(userId, channelId)
      }
    )

    // Ban vote update
    socket.on(
      'member:banVote',
      ({
        userId,
        channelId,
        votes,
        threshold,
      }: {
        userId: number
        channelId: string
        votes: number
        threshold: number
      }) => {
        console.log(
          `⚖️ Vote ban update for user:${userId} channel:${channelId} votes:${votes}/${threshold}`
        )
      }
    )

    // Invitation cleared
    socket.on('member:invitationCleared', ({ channelId }: { channelId: string }) => {
      const currentUserId = authStore.user?.id
      if (!currentUserId) return
      userChannelsStore.removeInvitation(channelId, currentUserId)
    })

    // Initial ban list
    socket.on(
      'member:banned:init',
      (list: { userId: number; channelId: string; isPermanent: boolean }[]) => {
        userChannelsStore.setBans(list)
      }
    )

    // Error handling
    socket.on('error:member', (payload: { message: string }) => {
      console.warn('⚠️ Member error:', payload.message)
    })
  }

  /**
   * Cleanup member socket listeners
   */
  function cleanup(): void {
    if (!socket) return

    socket.off('member:joined')
    socket.off('member:left')
    socket.off('member:invited')
    socket.off('member:kicked')
    socket.off('member:banned')
    socket.off('member:unbanned')
    socket.off('member:banVote')
    socket.off('member:invitationCleared')
    socket.off('member:banned:init')
    socket.off('error:member')
  }

  return {
    initListeners,
    cleanup,
  }
}
