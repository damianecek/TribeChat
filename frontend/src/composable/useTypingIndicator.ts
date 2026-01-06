import { computed, ref } from 'vue'
import { socketService } from 'src/services/SocketService'

/**
 * Composable for handling typing indicator logic
 */
export function useTypingIndicator(channelIdRef: () => string) {
  const socket = computed(() => socketService.getSocket())
  
  let isTyping = false
  let typingTimeout: ReturnType<typeof setTimeout>
  let lastDraftEmit = 0

  const text = ref('')

  /**
   * Handles typing events and emits to socket
   */
  const onTyping = () => {
    const channelId = channelIdRef()
    if (!channelId) return

    const now = Date.now()

    // Emit typing:start only once
    if (!isTyping) {
      isTyping = true
      socket.value?.emit('typing:start', { channelId, draft: text.value })
    }

    // Throttle draft updates to every 200ms
    if (now - lastDraftEmit > 200) {
      socket.value?.emit('typing:draft', { channelId, draft: text.value })
      lastDraftEmit = now
    }

    // Reset stop timer
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      isTyping = false
      socket.value?.emit('typing:stop', { channelId })
    }, 1200)
  }

  /**
   * Stops typing indicator
   */
  const stopTyping = () => {
    const channelId = channelIdRef()
    if (!channelId || !isTyping) return

    clearTimeout(typingTimeout)
    isTyping = false
    socket.value?.emit('typing:stop', { channelId })
  }

  return {
    text,
    onTyping,
    stopTyping,
  }
}
