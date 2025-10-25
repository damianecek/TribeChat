<template>
  <q-scroll-area ref="scrollAreaRef" class="fit column">
    <q-infinite-scroll reverse>
      <template v-slot:loading v-if="!messages.values">
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>

      <div ref="contentRef" class="q-pa-md column">
        <q-chat-message v-for="(msg, index) in messages" :key="index" :name="msg.author" :text="[msg.content]"
          :sent="msg.sent" :stamp="msg.timestamp.toTimeString()" :bg-color="messageColor(msg.sent)" />
      </div>
    </q-infinite-scroll>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useMessagesStore } from 'src/stores/messages'
import { useTabsStore } from 'src/stores/tabs'

const messagesStore = useMessagesStore()
const tabsStore = useTabsStore()

const scrollAreaRef = ref()
const contentRef = ref()

const messages = computed(() =>
  messagesStore.getMessages(tabsStore.activeTab)
)

function messageColor(sent: boolean): string {
  return sent ? 'grey-3' : 'amber-3'
}

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
