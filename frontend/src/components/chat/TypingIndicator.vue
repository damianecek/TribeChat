<template>
  <div v-if="Object.keys(typingUsers).length" class="q-pa-sm text-grey">
    <div
      v-for="(info, id) in typingUsers"
      :key="id"
      class="q-mb-xs cursor-pointer"
      @click="toggleDraft(id)"
    >
      <div v-if="!info.expanded" class="text-caption typing-indicator">
        {{ info.username }} is typing... (click to preview)
      </div>
      <div v-else class="rounded-borders">
        <div class="text-bold">{{ info.username }}'s draft:</div>
        <pre class="draft-window">{{ info.draft || '(empty)' }}</pre>
        <div class="text-primary text-caption">(click to hide)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { socketService } from 'src/services/SocketService'

interface Props {
  channelId: string
}

const props = defineProps<Props>()

const socket = computed(() => socketService.getSocket())

interface TypingUserInfo {
  username: string
  draft: string
  expanded: boolean
}

const typingUsers = reactive<Record<string, TypingUserInfo>>({})

function toggleDraft(id: string | number) {
  const stringId = String(id)
  if (!typingUsers[stringId]) return
  typingUsers[stringId].expanded = !typingUsers[stringId].expanded
}

function setupTypingListeners() {
  const cid = props.channelId
  if (!cid) return

  socket.value?.on(`typing:start:${cid}`, (data: { userId: number; username: string; draft?: string }) => {
    typingUsers[data.userId] = {
      username: data.username,
      draft: data.draft || '',
      expanded: false,
    }
  })

  socket.value?.on(`typing:draft:${cid}`, (data: { userId: number; draft: string }) => {
    const user = typingUsers[data.userId]
    if (user) {
      user.draft = data.draft
    }
  })

  socket.value?.on(`typing:stop:${cid}`, (data: { userId: number }) => {
    delete typingUsers[data.userId]
  })
}

function removeTypingListeners() {
  const cid = props.channelId
  if (!cid) return
  socket.value?.off(`typing:start:${cid}`)
  socket.value?.off(`typing:draft:${cid}`)
  socket.value?.off(`typing:stop:${cid}`)
}

onMounted(setupTypingListeners)
onUnmounted(removeTypingListeners)

watch(() => props.channelId, (newId, oldId) => {
  if (oldId !== newId) {
    removeTypingListeners()
    Object.keys(typingUsers).forEach((k) => delete typingUsers[k])
    setupTypingListeners()
  }
})
</script>

<style scoped>
.typing-indicator {
  cursor: pointer;
  opacity: 0.8;
}

.typing-indicator:hover {
  opacity: 1;
  text-decoration: underline;
}

.draft-window {
  white-space: pre-wrap;
  margin: 0;
  font-family: monospace;
}
</style>
