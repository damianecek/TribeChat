<template>
  <q-scroll-area ref="scrollAreaRef" class="fit column">
    <q-infinite-scroll reverse>
      <template v-slot:loading v-if="!messages.length">
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>

      <div ref="contentRef" class="q-pa-md column">
        <q-chat-message v-for="msg in messages" :key="msg.id" :name="msg.author" :text="[msg.content]" :sent="msg.sent"
          :stamp="msg.timestamp.toLocaleTimeString()" :bg-color="messageColor(msg.sent)" />
      </div>
    </q-infinite-scroll>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useMessagesStore } from 'src/stores/messages'
import { useTabsStore } from 'src/stores/tabs'

const messagesStore = useMessagesStore()
const tabsStore = useTabsStore()

const scrollAreaRef = ref()
const contentRef = ref()

// Aktívny kanál (ID)
const activeChannelId = computed(() => tabsStore.activeTab?.id || '')

// Zoznam správ pre daný kanál
const messages = computed(() => messagesStore.getMessages(activeChannelId.value))

// Načítanie správ pri mountnutí komponentu
onMounted(() => {
  if (activeChannelId.value) {
    messagesStore.fetchMessages(activeChannelId.value)
  }
})

// Sleduj zmenu tabu (prepnutie kanála)
watch(
  () => activeChannelId.value,
  (newId) => {
    if (newId) {
      messagesStore.fetchMessages(newId)
    }
  }
)

// Farba bubliny správy
function messageColor(sent: boolean): string {
  return sent ? 'grey-3' : 'amber-3'
}

// Auto-scroll na spodok pri nových správach
watch(messages, async () => {
  await nextTick()
  const scrollArea = scrollAreaRef.value?.$el?.querySelector('.scroll')
  const content = contentRef.value
  if (scrollArea && content) {
    scrollArea.scrollTop = scrollArea.scrollHeight
  }
})
</script>



<style scoped>
.q-scroll-area {
  height: 100%;
  background-color: transparent;
}
</style>
