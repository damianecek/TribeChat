<template>
  <q-scroll-area ref="scrollAreaRef" class="fit column">

    <q-infinite-scroll reverse>
      <template v-slot:loading v-if="!messages.length">
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

        <!-- === TYPING LIST === -->
        <div
          v-if="Object.keys(typingUsers).length"
          class="q-pa-sm text-grey"
        >
          <div
            v-for="(info, id) in typingUsers"
            :key="id"
            class="q-mb-xs cursor-pointer"
            @click="toggleDraft(id)"
          >
            <!-- collapsed -->
            <div
              v-if="!info.expanded"
              class="text-caption typing-indicator"
            >
              {{ info.username }} is typing... (click to preview)
            </div>

            <!-- expanded -->
            <div
              v-else
              class="rounded-borders"
            >
              <div class="text-bold">{{ info.username }}’s draft:</div>
              <pre class="draft-window">{{ info.draft || "(empty)" }}</pre>
              <div class="text-primary text-caption">(click to hide)</div>
            </div>
          </div>
        </div>

      </div>
    </q-infinite-scroll>
  </q-scroll-area>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
} from "vue";

import { useMessagesStore } from "src/stores/messages";
import { useTabsStore } from "src/stores/tabs";
import { useAuthStore } from "src/stores/auth";
import { socket } from "boot/socket";

const messagesStore = useMessagesStore();
const tabsStore = useTabsStore();
const authStore = useAuthStore();

const scrollAreaRef = ref();
const contentRef = ref();

// CURRENT USER
const username = computed(() => authStore.user?.nickname || "User");

// ACTIVE CHANNEL
const activeChannelId = computed(() => tabsStore.activeTab?.id || "");

// MESSAGES
const messages = computed(() =>
  messagesStore.getMessages(activeChannelId.value)
);

// === TYPING USERS (reactive dict) ===
const typingUsers = reactive<{
  [id: string]: { username: string; draft: string; expanded: boolean };
}>({});

// ======== LIFECYCLE ========
onMounted(() => {
  if (activeChannelId.value) {
    messagesStore.fetchMessages(activeChannelId.value);
  }
  setupTypingListeners();
});

onUnmounted(removeTypingListeners);

// ======== WATCH CHANNEL SWITCH ========
watch(
  () => activeChannelId.value,
  (newId) => {
    if (!newId) return;
    messagesStore.fetchMessages(newId);
    removeTypingListeners();
    setupTypingListeners();
    Object.keys(typingUsers).forEach((k) => delete typingUsers[k]);
  }
);

// ======== SOCKET TYPING EVENTS ========
function setupTypingListeners() {
  const cid = activeChannelId.value;
  if (!cid) return;

  socket?.on(`typing:start:${cid}`, (data) => {
    typingUsers[data.userId] = {
      username: data.username,
      draft: data.draft || "",
      expanded: false,
    };
  });

  socket?.on(`typing:draft:${cid}`, (data) => {
    const user = typingUsers[data.userId];
    if (user) {
      user.draft = data.draft;
    }
  });

  socket?.on(`typing:stop:${cid}`, (data) => {
    delete typingUsers[data.userId];
  });
}

function removeTypingListeners() {
  const cid = activeChannelId.value;
  if (!cid) return;
  socket?.off(`typing:start:${cid}`);
  socket?.off(`typing:draft:${cid}`);
  socket?.off(`typing:stop:${cid}`);
}

// ======== TOGGLE DRAFT VIEW ========
function toggleDraft(id: string | number) {
  if (!typingUsers[id]) return;
  typingUsers[id].expanded = !typingUsers[id].expanded;
}

// ======== MESSAGE COLORS ========
function messageColor(sent: boolean) {
  return sent ? "grey-3" : "amber-3";
}

// ======== AUTO-SCROLL ========
watch(messages, async () => {
  await nextTick();
  const scroll = scrollAreaRef.value?.$el?.querySelector(".scroll");
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
});

// ======== MENTION DETECTION ========
function isMention(text: string) {
  const uname = username.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`@${uname}(?![a-zA-Z0-9_])`);
  return regex.test(text);
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
