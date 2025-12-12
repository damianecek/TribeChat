import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { chatMessage } from 'src/types/message';
import { socket } from 'boot/socket';
import { useAuthStore } from 'stores/auth';
import { useTabsStore } from 'stores/tabs';
import { useChannelsStore } from 'stores/channels';
import { useUserChannelsStore } from 'stores/user_channels';
import { Notify, useQuasar } from 'quasar';

interface ServerMessage {
  id: string;
  channelId: string;
  authorId: number;
  author?: { nickname: string };
  content: string;
  createdAt: string;
}

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref<chatMessage[]>([]);
  const auth = useAuthStore();
  const tabsStore = useTabsStore();
  const channelsStore = useChannelsStore();
  const userChannelsStore = useUserChannelsStore();
  const $q = useQuasar();

  // === HELPERS ===
  function addMessage(msg: chatMessage, prepend = false) {
    if (messages.value.some((m) => m.id === msg.id)) return;

    const duplicate = messages.value.find(
      (m) =>
        m.chatId === msg.chatId &&
        m.content === msg.content &&
        m.author === msg.author &&
        Math.abs(m.timestamp.getTime() - msg.timestamp.getTime()) < 2000,
    );
    if (duplicate) return;

    if (prepend) {
      messages.value.unshift(msg);
      console.log('Prepended message', msg);
    } else {
      console.log('Added message', msg);
      messages.value.push(msg);
    }
  }

  function deleteMessage(id: string) {
    messages.value = messages.value.filter((m) => m.id !== id);
  }

  function updateMessage(id: string, content: string) {
    const msg = messages.value.find((m) => m.id === id);
    if (msg) msg.content = content;
  }

  function getMessages(chatId: string) {
    return messages.value.filter((m) => m.chatId === chatId);
  }

  function sendMessage(chatId: string, content: string) {
    if (!socket || !content.trim()) return;
    socket.emit('message:send', { channelId: chatId, content });
  }

  // === FETCH WITH PAGINATION ===
  function fetchMessages(channelId: string, limit = 50) {
    if (!socket) return;

    const firstMessageId = messages.value.find((m) => m.chatId === channelId)?.id;

    socket.emit('message:fetch', { channelId, beforeId: firstMessageId, limit });
  }

  function truncate(str: string, max: number = 15) {
    return str.length > max ? str.slice(0, max) + '...' : str;
  }

  function isMention(msg: string, username: string): boolean {
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`@${escaped}(?![a-zA-Z0-9_])`);
    return regex.test(msg);
  }

  function initSocketListeners(){
    if (!socket) return;
    cleanup();
    console.log('Initializing message socket listeners...');

    // === MESSAGE EVENTS ===
    socket.on('message:new', (msg: ServerMessage) => {
      const currentUserId = Number(auth.user?.id);
      const authorId = Number(msg.authorId);

      const messageData: chatMessage = {
        id: msg.id,
        chatId: msg.channelId,
        author: msg.author?.nickname || 'Unknown',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        sent: authorId === currentUserId,
      };

      addMessage(messageData);

      const activeChannelId = tabsStore.activeTab?.id;
      const isViewingChannel = activeChannelId === messageData.chatId;
      const notificationsSetting = userChannelsStore.getNotificationSetting(
        messageData.chatId,
        currentUserId,
      );

      if (notificationsSetting === 'silent' || auth.user?.status === 'DND') return;
      if (
        notificationsSetting === 'mentions' &&
        !isMention(messageData.content, auth.user!.nickname)
      )
        return;

      if (!messageData.sent && !isViewingChannel) {
        userChannelsStore.markUnread(messageData.chatId, currentUserId);
        const channel = channelsStore.channels.find((c) => c.id === messageData.chatId);
        const channelName = channel?.channelName || 'unknown channel';
        if ($q.appVisible) {
          Notify.create({
            message: `CH>${channelName} | User>${messageData.author}: ${truncate(messageData.content)}`,
            color: 'primary',
            icon: 'chat',
            position: 'bottom-right',
            timeout: 2500,
          });
        } else {
          Notify.create({
            message: `CH>${channelName} | User>${messageData.author}: ${truncate(messageData.content)}`,
            color: 'primary',
            icon: 'chat',
            position: 'bottom-right',
            actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
            timeout: 0,
          });
        }
      }
    });

    socket.on('message:deleted', ({ id }: { id: string }) => deleteMessage(id));

    socket.on('message:updated', (msg: ServerMessage) => updateMessage(msg.id, msg.content));

    socket.on('message:list', (list: ServerMessage[]) => {
      if (!list.length) {
        return;
      } // no more messages to fetch

      const currentUserId = Number(auth.user?.id);
      list.reverse().forEach((msg) => {
        addMessage(
          {
            id: msg.id,
            chatId: msg.channelId,
            author: msg.author?.nickname || 'Unknown',
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            sent: Number(msg.authorId) === currentUserId,
          },
          true,
        ); // prepend older messages
      });
    });
  }

  function cleanup() {
    if (!socket) return;

    socket.off('message:new');
    socket.off('message:deleted');
    socket.off('message:updated');
    socket.off('message:list');

    tabsStore.tabs = []
    tabsStore.activeTab = null
    messages.value = [];
  }

  return {
    messages,
    addMessage,
    deleteMessage,
    updateMessage,
    getMessages,
    sendMessage,
    fetchMessages,
    initSocketListeners,
    cleanup
  };
});

export type MessagesStore = ReturnType<typeof useMessagesStore>;
