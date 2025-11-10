// src/boot/socket.ts
import { boot } from 'quasar/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAuthStore } from 'src/stores/auth';
import { useChannelsStore } from 'stores/channels';
import { useUserChannelsStore } from 'stores/user_channels';
import { useUserStore } from 'stores/user';
import type { Channel, UserStatus } from 'src/types';

let socket: Socket | null = null;

export default boot(() => {
  const auth = useAuthStore();
  const channelsStore = useChannelsStore();
  const userChannelsStore = useUserChannelsStore();
  const userStore = useUserStore();

  function connectSocket() {
    // už pripojený?
    if (socket) {
      console.log('⚠️ Socket already connected, skipping...');
      return;
    }

    // musí existovať token (a user je ideálne už načítaný cez boot/auth.ts)
    if (!auth.token) {
      console.warn('❌ Missing token, skipping socket connection.');
      return;
    }

    console.log('🟢 Connecting socket with token:', auth.token.slice(0, 10) + '...');

    socket = io('http://localhost:3333', {
      auth: { token: auth.token },
    });

    // po pripojení – init fetch kanálov cez WS
    socket.on('connect', () => {
      console.log('✅ WS connected:', socket?.id);
      socket?.emit('request:channels');
    });

    socket.on('disconnect', (reason: string) => {
      console.log('🔴 WS disconnected:', reason);
      socket = null;
    });

    // --- USER STATUS (Online / Away / DND / Offline) ---
    socket.on('user:status', (payload: { userId: number; status: UserStatus }) => {
      userStore.updateUserStatus(payload.userId, payload.status);

      // ak ide o aktuálne prihláseného usera, syncni aj currentUser + auth.user
      if (userStore.currentUser?.id === payload.userId) {
        userStore.setCurrentUserStatus(payload.status);
      }
      if (auth.user?.id === payload.userId) {
        auth.user.status = payload.status;
      }
    });

    // --- USER-CHANNEL MEMBERSHIP ---
    socket.on(
      'userChannel:created',
      ({ userId, channelId }: { userId: number; channelId: string }) => {
        userChannelsStore.addUserToChannel(userId, channelId);
      },
    );

    socket.on(
      'userChannel:removed',
      ({ userId, channelId }: { userId: number; channelId: string }) => {
        userChannelsStore.removeUserFromChannel(userId, channelId);
      },
    );

    // --- CHANNELS (realtime CRUD) ---
    socket.on('response:channels', (channels: Channel[]) => {
      channelsStore.setChannels(channels);
    });

    socket.on('channel:created', (channel: Channel) => {
      console.log('🆕 nový kanál:', channel);
      channelsStore.addChannel(channel);
    });

    socket.on('channel:updated', (channel: Channel) => {
      void channelsStore.updateChannel(channel.id, channel.channelName, channel.isPublic);
    });

    socket.on('channel:deleted', (id: string) => {
      void channelsStore.deleteChannel(id);
    });
  }

  // Reakcia na zmeny v auth stor-e
  auth.$subscribe((_, state) => {
    if (state.token && !socket) {
      connectSocket();
    }

    if (!state.token && socket) {
      console.log('🔴 Disconnecting socket due to logout...');
      socket.disconnect();
      socket = null;
    }
  });

  // pri prvom loade (napr. reload po prihlásení)
  if (auth.token && !socket) {
    connectSocket();
  }
});

export { socket };
