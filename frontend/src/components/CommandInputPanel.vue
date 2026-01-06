<template>
  <MessageInput
    v-model="text"
    @typing="onTyping"
    @send="sendMessage"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useTabsStore } from 'src/stores/tabs'
import { useMessagesStore } from 'src/stores/messages'
import { useAuthStore } from 'src/stores/auth'
import { v4 as uuid } from 'uuid'
import { useCommands } from 'src/composable/useCommands'
import { useTypingIndicator } from 'src/composable/useTypingIndicator'
import MessageInput from 'components/chat/MessageInput.vue'

const $q = useQuasar()
const tabStore = useTabsStore()
const messagesStore = useMessagesStore()
const auth = useAuthStore()

const { executeCommand } = useCommands()
const typingIndicator = useTypingIndicator(() => tabStore.activeTab?.id || '')

// Local text ref for v-model
const text = ref('')

// Sync text with typing indicator and trigger typing events
const onTyping = () => {
  typingIndicator.text.value = text.value
  typingIndicator.onTyping()
}

const sendMessage = () => {
  const content = text.value.trim()
  if (!content) return

  // Handle slash commands
  if (content.startsWith('/')) {
    const handled = executeCommand(content)
    if (handled) {
      text.value = ''
      return
    }
  }

  const channelId = tabStore.activeTab?.id
  if (!channelId) {
    $q.notify({ type: 'warning', message: 'No active channel selected' })
    return
  }

  // Create optimistic message
  const msg = {
    id: uuid(),
    chatId: channelId,
    author: auth.user?.nickname || 'You',
    content,
    timestamp: new Date(),
    sent: true,
  }

  // Add locally
  messagesStore.addMessage(msg)

  // Send via store (which uses socket internally)
  messagesStore.sendMessage(channelId, content)

  text.value = ''
}
</script>
