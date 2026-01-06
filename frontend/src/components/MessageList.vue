<template>
  <q-scroll-area ref="scrollAreaRef" class="fit column">
    <q-infinite-scroll reverse :offset="0" @load="onLoadMore">
      <template v-slot:loading v-if="messages.length > 20">
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>

      <div ref="contentRef" class="q-pa-md column">
        <!-- === MESSAGES === -->
        <q-chat-message
          v-for="msg in messages"
          :key="msg.id"
          :name="msg.author"
          :text="[msg.content]"
          :sent="msg.sent"
          :stamp="msg.timestamp.toLocaleTimeString()"
          :bg-color="isMention(msg.content) ? 'pink-3' : messageColor(msg.sent)"
          :text-color="isMention(msg.content) ? 'black' : undefined"
          :class="{ mention: isMention(msg.content) }"
        />

        <!-- === TYPING INDICATOR === -->
        <TypingIndicator :channel-id="activeChannelId" />
      </div>
    </q-infinite-scroll>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'

import { useMessagesStore } from 'src/stores/messages'
import { useTabsStore } from 'src/stores/tabs'
import { useAuthStore } from 'src/stores/auth'
import TypingIndicator from 'components/chat/TypingIndicator.vue'

const messagesStore = useMessagesStore()
const tabsStore = useTabsStore()
const authStore = useAuthStore()

const scrollAreaRef = ref()
const contentRef = ref()

// CURRENT USER
const username = computed(() => authStore.user?.nickname || 'User')

// ACTIVE CHANNEL
const activeChannelId = computed(() => tabsStore.activeTab?.id || '')

// MESSAGES
const messages = computed(() => messagesStore.getMessages(activeChannelId.value))

// ======== LIFECYCLE ========
onMounted(() => {
  if (activeChannelId.value && messages.value.length === 0) {
      messagesStore.fetchMessages(activeChannelId.value)
  }
})

// ======== WATCH CHANNEL SWITCH ========
watch(
  () => activeChannelId.value,
  (newId) => {
    if (!newId) return
    messagesStore.fetchMessages(newId)
  },
)

// ======== INFINITE SCROLL ========
function onLoadMore(index: number, done: (stop?: boolean) => void) {
  const scrollEl = scrollAreaRef.value?.$el?.querySelector('.scroll')
  if (!scrollEl) return done()

  const SCROLL_OFFSET = 50

  if (messages.value.length > 20) {
    messagesStore.fetchMessages(activeChannelId.value)
  }

  setTimeout(() => {
    scrollEl.scrollTop += SCROLL_OFFSET
    done()
  }, 300)
}

// ======== MESSAGE COLORS ========
function messageColor(sent: boolean) {
  return sent ? 'grey-3' : 'amber-3'
}

// ======== AUTO-SCROLL (only if near bottom) ========
watch(messages, async () => {
  await nextTick()
  const scrollEl = scrollAreaRef.value?.$el?.querySelector('.scroll')
  if (!scrollEl) return

  const threshold = 700
  const distanceFromBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight

  if (distanceFromBottom <= threshold) {
    scrollEl.scrollTop = scrollEl.scrollHeight
  }
})

// ======== MENTION DETECTION ========
function isMention(text: string) {
  const uname = username.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`@${uname}(?![a-zA-Z0-9_])`)
  return regex.test(text)
}
</script>

<style scoped>
.q-scroll-area {
  height: 100%;
  background-color: transparent;
}

.mention {
  background: rgba(233, 30, 99, 0.15);
  font-weight: bold;
  border-radius: 4px;
}
</style>
