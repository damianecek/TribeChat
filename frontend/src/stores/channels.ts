import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Channel } from 'src/types';

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref<Channel[]>([]);

  function setChannels(newChannels: Channel[]) {
    channels.value = newChannels;
  }

  function addChannel(channel: Channel) {
    channels.value.push(channel);
  }

  function updateChannel(id: string, newName: string) {
    const c = channels.value.find((c) => c.id === id);
    if (c) c.name = newName;
  }

  function deleteChannel(id: string) {
    channels.value = channels.value.filter((c) => c.id !== id);
  }

  return { channels, setChannels, addChannel, deleteChannel, updateChannel };
});
