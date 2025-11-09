// src/boot/socket.ts
import { boot } from 'quasar/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAuthStore } from 'src/stores/auth';
import { useChannelsStore } from 'stores/channels';
import type { Channel } from 'src/types';
import { useUserChannelsStore } from 'stores/user_channels';

let socket: Socket | null = null;

export default boot(() => {
  const auth = useAuthStore();
  const channelsStore = useChannelsStore();
  const userChannelsStore = useUserChannelsStore();

  function connectSocket() {
    if (socket || !auth.token) return;

    socket = io('http://localhost:3333', {
      auth: { token: auth.token },
    });

    socket.on('connect', () => {
      console.log('WS connected:', socket?.id);
      socket?.emit('request:channels');
    });

    socket.on('userChannel:created', (payload: { userId: number; channelId: string }) => {
      userChannelsStore.addUserToChannel(payload.userId, payload.channelId);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('WS disconnected:', reason);
    });

    socket.on('channel:created', (channel: Channel) => {
      console.log('nový kanál:', channel);
      channelsStore.addChannel(channel);
    });

    socket.on('channel:updated', (channel: Channel) => {
      channelsStore.updateChannel(channel.id, channel.channelName, channel.isPublic);
    });

    socket.on('channel:deleted', (id: string) => {
      channelsStore.deleteChannel(id);
    });
  }

  auth.$subscribe((_, state) => {
    if (state.token) {
      connectSocket();
    }
  });

  if (auth.token) {
    connectSocket();
  }
});

export { socket };
