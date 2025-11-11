import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { chatMessage } from 'src/types/message';
import { socket } from 'boot/socket';
import { useAuthStore } from 'stores/auth';

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

  if (socket) {
    socket.on('message:new', (msg: ServerMessage) => {
      const currentUserId = Number(auth.user?.id);
      const authorId = Number(msg.authorId);

      addMessage({
        id: msg.id,
        chatId: msg.channelId,
        author: msg.author?.nickname || 'Unknown',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        sent: authorId === currentUserId, // ✅ vždy porovnávaj čísla
      });
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
