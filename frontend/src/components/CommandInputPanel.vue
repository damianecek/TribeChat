<template>
  <div class="row items-center q-px-md q-mt-auto">
    <div class="col">
      <q-input
        v-model="text"
        autogrow
        placeholder="Type a message or command..."
        filled
        dense
        @update:model-value="onTyping"
        @keydown.enter.prevent="handleEnter"
      >
        <template #append>
          <q-btn @click="sendMessage" round dense flat icon="send" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useTabsStore } from 'src/stores/tabs'
import { useChannelActions } from 'src/composable/useChannelActions'
import { useMessagesStore } from 'src/stores/messages'
import { useAuthStore } from 'src/stores/auth'
import { socket } from 'boot/socket'
import { v4 as uuid } from 'uuid'

const $q = useQuasar()
const text = ref('')
const tabStore = useTabsStore()
const messagesStore = useMessagesStore()
const auth = useAuthStore()

const {
  addOrGetChannel,
  cancelActiveChannel,
  inviteUserToChannel,
  kickUserFromChannel,
  listChannelMembers,
} = useChannelActions()

let isTyping = false
let typingTimeout: ReturnType<typeof setTimeout>
let lastDraftEmit = 0

function onTyping() {
  const channelId = tabStore.activeTab?.id
  if (!channelId) return

  const now = Date.now()

  // Emit typing:start only once
  if (!isTyping) {
    isTyping = true
    socket?.emit("typing:start", { channelId, draft: text.value })
  }

  // Throttle draft updates to every 200ms
  if (now - lastDraftEmit > 200) {
    socket?.emit("typing:draft", { channelId, draft: text.value })
    lastDraftEmit = now
  }

  // Reset stop timer
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    isTyping = false
    socket?.emit("typing:stop", { channelId })
  }, 5000)
}


function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err) || String(err)
  } catch {
    return String(err)
  }
}

// === COMMAND HANDLING ===
const executeCommand = (input: string): boolean => {
  const trimmed = input.trim()
  if (!trimmed.startsWith('/')) return false

  const parts = trimmed.slice(1).split(/\s+/)
  const cmd = parts[0]?.toLowerCase() ?? ''
  const args = parts.slice(1)

  switch (cmd) {
    case 'join': {
      const isPrivate = args.includes('--private')
      const filteredArgs = args.filter((a) => a !== '--private')
      const channelName = filteredArgs.join(' ') || 'general'
      try {
        addOrGetChannel(channelName, !isPrivate)
      } catch (err) {
        const msg = getErrorMessage(err)
        $q.notify({ type: 'negative', message: `Join failed: ${msg}` })
      }
      return true
    }

    case 'cancel': {
      try {
        const result = cancelActiveChannel()
        if (!result) {
          $q.notify({ type: 'warning', message: 'No active channel to leave' })
        } else {
          $q.notify({ type: 'positive', message: `Left #${result.channelName}` })
        }
      } catch (err) {
        $q.notify({ type: 'negative', message: getErrorMessage(err) })
      }
      return true
    }

    case 'invite': {
      const userId = args[0]
      if (!userId) {
        $q.notify({ type: 'warning', message: 'Usage: /invite <userId>' })
        return true
      }
      try {
        inviteUserToChannel(userId)
        $q.notify({ type: 'positive', message: `Invited ${userId}` })
      } catch (err) {
        $q.notify({ type: 'negative', message: getErrorMessage(err) })
      }
      return true
    }

    case 'kick': {
      const userId = args[0]
      if (!userId) {
        $q.notify({ type: 'warning', message: 'Usage: /kick <userId>' })
        return true
      }
      try {
        const action = kickUserFromChannel(userId)
        if (action === 'kicked') {
          $q.notify({ type: 'positive', message: `Kicked ${userId}` })
        } else {
          $q.notify({ type: 'warning', message: `Voted to ban ${userId}` })
        }
      } catch (err) {
        $q.notify({ type: 'negative', message: getErrorMessage(err) })
      }
      return true
    }

    case 'list': {
      try {
        const members = listChannelMembers()
        if (!members.length) {
          $q.notify({ type: 'info', message: 'No members found' })
        } else {
          $q.notify({ type: 'info', message: `Members: ${members.join(', ')}` })
        }
      } catch (err) {
        $q.notify({ type: 'negative', message: getErrorMessage(err) })
      }
      return true
    }

    default:
      $q.notify({ type: 'warning', message: `Unknown command: /${cmd}` })
      return true
  }
}

// === SEND MESSAGE ===
const sendMessage = () => {
  const content = text.value.trim()
  if (!content) return

  // handle slash commands
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

  // create optimistic message maybe useless but should feel snappy lol --Damianko last words before disaster 2025
  const msg = {
    id: uuid(),
    chatId: channelId,
    author: auth.user?.nickname || 'You',
    content,
    timestamp: new Date(),
    sent: true,
  }

  // add locally
  messagesStore.addMessage(msg)

  // emit to WS
  socket?.emit('message:send', { channelId, content })

  text.value = ''
}

// === Handle Enter (Shift+Enter = newline) ===
const handleEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    text.value = text.value.substring(0, start) + '\n' + text.value.substring(end)
    void nextTick(() => {
      target.selectionStart = target.selectionEnd = start + 1
    })
  } else {
    void sendMessage()
  }
}
</script>
