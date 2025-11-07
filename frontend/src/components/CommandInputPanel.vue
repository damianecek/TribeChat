<template>
  <div class="row items-center q-px-md q-mt-auto">
    <div class="col">
      <q-input
      v-model="text"
      autogrow
      placeholder="Type a command..."
      filled
      dense
      @keydown.enter.prevent="handleEnter"
      >
        <template v-slot:append>
          <q-btn
            @click="sendMessage"
            round
            dense
            flat
            icon="send"
          />
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
import { v4 as uuid } from 'uuid'

const $q = useQuasar()
const text = ref('')
const tabStore = useTabsStore()
const messagesStore = useMessagesStore()
const { addOrGetChannel,
      cancelActiveChannel,
      inviteUserToChannel,
      kickUserFromChannel,
      listChannelMembers
    } = useChannelActions()

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err) || String(err)
  } catch {
    return String(err)
  }
}

const executeCommand = (input: string): boolean => {
  const trimmed = input.trim()
  if (!trimmed.startsWith('/')) return false

  const parts = trimmed.slice(1).split(/\s+/)
  const cmd = parts[0]?.toLowerCase() ?? ''
  const args = parts.slice(1)

  switch (cmd) {
    case 'join': {
      const channelName = args.join(' ') || 'general'
      try {
       addOrGetChannel(channelName)
      } catch (err) {
        console.warn('Failed to join channel', err)
        const msg = getErrorMessage(err)
        $q.notify({
          type: 'negative',
          message: msg ? `Join failed: ${msg}` : 'Failed to join channel'
        })
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
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        console.warn('Failed to cancel/leave channel', err)
        $q.notify({
          type: 'negative',
          message: msg ? `Leave failed: ${msg}` : 'Failed to leave channel'
        })
      }
      return true
    }

    case 'invite': {
    // /invite <userId>
    const userId = args[0]
    if (!userId) {
      $q.notify({ type: 'warning', message: 'Usage: /invite <userId>' })
      return true
    }
    try {
      inviteUserToChannel(userId)
      $q.notify({ type: 'positive', message: `Invited ${userId}` })
    } catch (err: unknown) {
      $q.notify({ type: 'negative', message: getErrorMessage(err) || 'Invite failed' })
    }
    return true
    }

    case 'kick': {
      // /kick <userId>
      const userId = args[0]
      if (!userId) {
        $q.notify({ type: 'warning', message: 'Usage: /kick <userId>' })
        return true
      }
      try {
        kickUserFromChannel(userId)
        $q.notify({ type: 'positive', message: `Kicked ${userId}` })
      } catch (err: unknown) {
        $q.notify({ type: 'negative', message: getErrorMessage(err) || 'Kick failed' })
      }
      return true
    }

    case 'list': {
      // /list [channelId]
      try {
        const members = listChannelMembers()
        if (!members.length) {
          $q.notify({ type: 'info', message: 'No members found' })
        } else {
          $q.notify({ type: 'info', message: `Members: ${members.join(', ')}` })
        }
      } catch (err: unknown) {
        $q.notify({ type: 'negative', message: getErrorMessage(err) || 'List failed' })
      }
      return true
    }

    default:
      console.warn('Unknown command:', cmd)
      $q.notify({ type: 'warning', message: `Unknown command: /${cmd}` })
      return true
  }
}

const sendMessage = () => {
  if (!text.value.trim()) return

  // if message is a command, execute and clear input
  if (text.value.trim().startsWith('/')) {
    const handled = executeCommand(text.value)
    if (handled) {
      text.value = ''
      return
    }
  }

  const msg = {
    id: uuid(),
    chatId: tabStore.activeTab,
    author: 'Ty',
    content: text.value,
    timestamp: new Date(),
    sent: true
  }

  messagesStore.addMessage(msg)
  text.value = ''
}

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
