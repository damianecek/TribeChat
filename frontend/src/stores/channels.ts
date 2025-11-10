import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Channel } from 'src/types';
import { useAuthStore } from 'stores/auth';
import { socket } from 'boot/socket';
import { useUserChannelsStore } from 'stores/user_channels';

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref<Channel[]>([]);
  const auth = useAuthStore();
  const userChannelsStore = useUserChannelsStore();

  function setChannels(newChannels: Channel[]) {
    channels.value = newChannels;
  }

  function addChannel(channel: Channel) {
    const exists = channels.value.some((c) => c.id === channel.id);
    if (!exists) channels.value.unshift(channel);
  }

  function updateChannelLocal(id: string, newName: string, isPublic: boolean) {
    const channel = channels.value.find((item) => item.id === id);
    if (channel) {
      channel.channelName = newName;
      channel.isPublic = isPublic;
    }
  }

  function deleteChannelLocal(id: string) {
    channels.value = channels.value.filter((channel) => channel.id !== id);
  }

  async function createChannel(name: string, isPrivate: boolean) {
    if (!auth.user) return;

    try {
      const res = await fetch('http://localhost:3333/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          channelName: name,
          isPublic: !isPrivate,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        addChannel(created);

        // Admin sa automaticky pridá ako člen
        userChannelsStore.addUserToChannel(auth.user.id, created.id);

        return created;
      } else {
        console.error('Error creating channel:', await res.text());
      }
    } catch (err) {
      console.error('Create channel failed:', err);
    }
  }

  async function updateChannel(id: string, newName: string, isPrivate: boolean) {
    try {
      const res = await fetch(`http://localhost:3333/channels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          channelName: newName,
          isPublic: !isPrivate,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        updateChannelLocal(updated.id, updated.channelName, updated.isPublic);
      } else {
        console.error('Update channel failed:', await res.text());
      }
    } catch (err) {
      console.error('Update channel error:', err);
    }
  }

  async function deleteChannel(id: string) {
    try {
      const res = await fetch(`http://localhost:3333/channels/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (res.ok) {
        // backend vyšle event channel:deleted
      } else {
        console.error('Delete channel failed:', await res.text());
      }
    } catch (err) {
      console.error('Delete channel error:', err);
    }
  }

  if (socket) {
    socket.on('channel:created', (channel: Channel) => {
      addChannel(channel);
    });

    socket.on('channel:updated', (channel: Channel) => {
      updateChannelLocal(channel.id, channel.channelName, channel.isPublic);
    });

    socket.on('channel:deleted', (id: string) => {
      deleteChannelLocal(id);
    });
  }

  return {
    channels,
    setChannels,
    addChannel,
    updateChannelLocal,
    deleteChannelLocal,
    createChannel,
    updateChannel,
    deleteChannel,
  };
});

export type ChannelsStore = ReturnType<typeof useChannelsStore>;
