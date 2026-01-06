import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { chatMessage } from 'src/types/message'
import { socketService } from 'src/services/SocketService'
import { useTabsStore } from 'stores/tabs'

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref<chatMessage[]>([])
  const tabsStore = useTabsStore()

  /**
   * Add a message to the store
   */
  function addMessage(msg: chatMessage, prepend = false): void {
    // Check for duplicate by ID
    if (messages.value.some((m) => m.id === msg.id)) return

    // Check for duplicate by content and timing
    const duplicate = messages.value.find(
      (m) =>
        m.chatId === msg.chatId &&
        m.content === msg.content &&
        m.author === msg.author &&
        Math.abs(m.timestamp.getTime() - msg.timestamp.getTime()) < 2000
    )
    if (duplicate) return

    if (prepend) {
      messages.value.unshift(msg)
      console.log('Prepended message', msg)
    } else {
      console.log('Added message', msg)
      messages.value.push(msg)
    }
  }

  /**
   * Delete a message from the store
   */
  function deleteMessage(id: string): void {
    messages.value = messages.value.filter((m) => m.id !== id)
  }

  /**
   * Update a message in the store
   */
  function updateMessage(id: string, content: string): void {
    const msg = messages.value.find((m) => m.id === id)
    if (msg) msg.content = content
  }

  /**
   * Get all messages for a specific channel
   */
  function getMessages(chatId: string): chatMessage[] {
    return messages.value.filter((m) => m.chatId === chatId)
  }

  /**
   * Send a message via socket
   */
  function sendMessage(chatId: string, content: string): void {
    const socket = socketService.getSocket()
    if (!socket || !content.trim()) return
    socket.emit('message:send', { channelId: chatId, content })
  }

  /**
   * Fetch messages with pagination
   */
  function fetchMessages(channelId: string, limit = 50): void {
    const socket = socketService.getSocket()
    if (!socket) return

    const firstMessageId = messages.value.find((m) => m.chatId === channelId)?.id
    socket.emit('message:fetch', { channelId, beforeId: firstMessageId, limit })
  }

  /**
   * Cleanup messages store
   */
  function cleanup(): void {
    tabsStore.tabs = []
    tabsStore.activeTab = null
    messages.value = []
  }

  return {
    messages,
    addMessage,
    deleteMessage,
    updateMessage,
    getMessages,
    sendMessage,
    fetchMessages,
    cleanup,
  }
})

export type MessagesStore = ReturnType<typeof useMessagesStore>
