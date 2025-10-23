<template>
  <div class="row items-center q-px-md q-mt-auto">
    <div class="col">
      <q-input v-model="text" autogrow placeholder="Type a command..." filled dense
        @keydown.enter.prevent="handleEnter" />
    </div>
    <div class="col-shrink">
      <q-btn @click="sendMessage" class="q-ml-sm q-mr-lg" round dense flat icon="send" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useTabsStore } from 'src/stores/tabs'
import { useMessagesStore } from 'src/stores/messages'
import { v4 as uuid } from 'uuid'

const text = ref('')
const tabStore = useTabsStore()
const messagesStore = useMessagesStore()

const sendMessage = () => {
  if (!text.value.trim()) return

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
    sendMessage()
  }
}
</script>
