import type { Socket } from 'socket.io-client'
import { useMessagesStore } from 'stores/messages'
import { useAuthStore } from 'stores/auth'
import { useTabsStore } from 'stores/tabs'
import { useChannelsStore } from 'stores/channels'
import { useUserChannelsStore } from 'stores/user_channels'
import { Notify, useQuasar } from 'quasar'
import type { chatMessage } from 'src/types/message'

interface ServerMessage {
  id: string
  channelId: string
  authorId: number
  author?: { nickname: string }
  content: string
  createdAt: string
}

/**
 * Composable for managing message-related socket events
 */
export function useMessageSocket(socket: Socket | null) {
  const messagesStore = useMessagesStore()
  const authStore = useAuthStore()
  const tabsStore = useTabsStore()
  const channelsStore = useChannelsStore()
  const userChannelsStore = useUserChannelsStore()
  const $q = useQuasar()

  function truncate(str: string, max: number = 15): string {
    return str.length > max ? str.slice(0, max) + '...' : str
  }

  function isMention(msg: string, username: string): boolean {
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`@${escaped}(?![a-zA-Z0-9_])`)
    return regex.test(msg)
  }

  /**
   * Initialize message socket listeners
   */
  function initListeners(): void {
    if (!socket) return

    // New message
    socket.on('message:new', (msg: ServerMessage) => {
      const currentUserId = Number(authStore.user?.id)
      const authorId = Number(msg.authorId)

      const messageData: chatMessage = {
        id: msg.id,
        chatId: msg.channelId,
        author: msg.author?.nickname || 'Unknown',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        sent: authorId === currentUserId,
      }

      messagesStore.addMessage(messageData)

      const activeChannelId = tabsStore.activeTab?.id
      const isViewingChannel = activeChannelId === messageData.chatId
      const notificationsSetting = userChannelsStore.getNotificationSetting(
        messageData.chatId,
        currentUserId
      )

      if (notificationsSetting === 'silent' || authStore.user?.status === 'DND') return
      if (
        notificationsSetting === 'mentions' &&
        !isMention(messageData.content, authStore.user!.nickname)
      )
        return

      if (!messageData.sent && !isViewingChannel) {
        userChannelsStore.markUnread(messageData.chatId, currentUserId)
        const channel = channelsStore.channels.find((c) => c.id === messageData.chatId)
        const channelName = channel?.channelName || 'unknown channel'
        if ($q.appVisible) {
          Notify.create({
            message: `CH>${channelName} | User>${messageData.author}: ${truncate(messageData.content)}`,
            color: 'primary',
            icon: 'chat',
            position: 'bottom-right',
            timeout: 2500,
          })
        } else {
          Notify.create({
            message: `CH>${channelName} | User>${messageData.author}: ${truncate(messageData.content)}`,
            color: 'primary',
            icon: 'chat',
            position: 'bottom-right',
            actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
            timeout: 0,
          })
        }
      }
    })

    // Message deleted
    socket.on('message:deleted', ({ id }: { id: string }) => {
      messagesStore.deleteMessage(id)
    })

    // Message updated
    socket.on('message:updated', (msg: ServerMessage) => {
      messagesStore.updateMessage(msg.id, msg.content)
    })

    // Message list (pagination response)
    socket.on('message:list', (list: ServerMessage[]) => {
      if (!list.length) return

      const currentUserId = Number(authStore.user?.id)
      list.reverse().forEach((msg) => {
        messagesStore.addMessage(
          {
            id: msg.id,
            chatId: msg.channelId,
            author: msg.author?.nickname || 'Unknown',
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            sent: Number(msg.authorId) === currentUserId,
          },
          true
        )
      })
    })

    // Error handling
    socket.on('error:message', (payload: { message: string }) => {
      console.warn('⚠️ Message error:', payload.message)
    })
  }

  /**
   * Cleanup message socket listeners
   */
  function cleanup(): void {
    if (!socket) return

    socket.off('message:new')
    socket.off('message:deleted')
    socket.off('message:updated')
    socket.off('message:list')
    socket.off('error:message')
  }

  return {
    initListeners,
    cleanup,
  }
}
