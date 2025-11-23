import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { chatMessage } from 'src/types/message';
import { socket } from 'boot/socket';
import { useAuthStore } from 'stores/auth';
import { useTabsStore } from 'stores/tabs';
import { useChannelsStore } from 'stores/channels';
import { useUserChannelsStore } from 'stores/user_channels';
import { Notify } from 'quasar';


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

  function addMessage(msg: chatMessage) {
    // ✅ Nepridávaj duplicitné správy (rovnaké id)
    if (messages.value.some((m) => m.id === msg.id)) return;

    // ✅ Nepridávaj rovnaký obsah od rovnakého autora v rovnaký čas
    const duplicate = messages.value.find(
      (m) =>
        m.chatId === msg.chatId &&
        m.content === msg.content &&
        m.author === msg.author &&
        Math.abs(m.timestamp.getTime() - msg.timestamp.getTime()) < 2000,
    );
    if (duplicate) return;

    messages.value.push(msg);
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
    if (!socket) return;
    socket.emit('message:send', { channelId: chatId, content });
  }

  function fetchMessages(channelId: string) {
    if (!socket) return;
    socket.emit('message:fetch', channelId);
  }

  function truncate(str: string, max: number = 15) {
    return str.length > max ? str.slice(0, max) + "..." : str;
  }

  if (socket) {
    socket.on('message:new', (msg: ServerMessage) => {
      const currentUserId = Number(auth.user?.id);
      const authorId = Number(msg.authorId);

      const messageData = {
        id: msg.id,
        chatId: msg.channelId,
        author: msg.author?.nickname || 'Unknown',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        sent: authorId === currentUserId
      };

      const isOwnMessage = authorId === currentUserId;

      // Add message
      addMessage(messageData);
      const activeChannelId = tabsStore.activeTab?.id;
      const isViewingChannel = activeChannelId === messageData.chatId;

      const notificationsSetting = userChannelsStore.getNotificationSetting(messageData.chatId, currentUserId);

      if (notificationsSetting === 'silent') {
        return; // No notifications
      }

      // 🔔 Show notification ONLY if:
      // - It's not your own message
      // - The user is NOT currently viewing that chat (optional)
      if (!isOwnMessage && !isViewingChannel) {
        userChannelsStore.markUnread(messageData.chatId, currentUserId);
        const channel = channelsStore.channels.find(c => c.id === messageData.chatId);
        const channelName = channel ? channel.channelName : 'unkonwn channel';
        Notify.create({
          message: `CH>${channelName}|User>${messageData.author}: ${truncate(messageData.content)}`,
          color: 'primary',
          icon: 'chat',
          position: 'bottom-right',
          timeout: 2500
        });
      }
    });


    socket.on('message:deleted', ({ id }: { id: string }) => {
      deleteMessage(id);
    });

    socket.on('message:updated', (msg: ServerMessage) => {
      updateMessage(msg.id, msg.content);
    });

    socket.on('message:list', (list: ServerMessage[]) => {
      const currentUserId = Number(auth.user?.id);
      list.forEach((msg) => {
        const authorId = Number(msg.authorId);
        addMessage({
          id: msg.id,
          chatId: msg.channelId,
          author: msg.author?.nickname || 'Unknown',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          sent: authorId === currentUserId,
        });
      });
    });
  }

  return {
    messages,
    addMessage,
    deleteMessage,
    updateMessage,
    getMessages,
    sendMessage,
    fetchMessages,
  };
});

export type MessagesStore = ReturnType<typeof useMessagesStore>;
