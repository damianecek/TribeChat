import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { chatMessage } from 'src/types/message';

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref<chatMessage[]>([]);

  const addMessage = (msg: chatMessage) => {
    messages.value.push(msg);
  };

  const getMessages = (chatId: string) => {
    return messages.value.filter((m) => m.chatId === chatId);
  };

  return { messages, addMessage, getMessages };
});
