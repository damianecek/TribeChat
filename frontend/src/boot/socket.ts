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
    if (socket) return;
    if (!auth.token) return;

    console.log('🟢 Connecting socket...');

    socket = io('http://localhost:3333', {
      auth: { token: auth.token },
    });

    // === CONNECTION ===
    socket.on('connect', () => {
      console.log('✅ WS connected:', socket?.id);
      socket?.emit('request:channels');

      // 🔁 Rejoin all channels where the user is member
      const userId = auth.user?.id;
      if (userId) {
        const userChannels = userChannelsStore.getChannelsForUser(userId);
        userChannels.forEach((cid) => socket?.emit('member:join', cid));
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 WS disconnected:', reason);
      socket = null;
    });

    // === USER STATUS (Online / Offline / Away / DND) ===
    socket.on('user:status', ({ userId, status }: { userId: number; status: UserStatus }) => {
      userStore.updateUserStatus(userId, status);
      if (userStore.currentUser?.id === userId) {
        userStore.setCurrentUserStatus(status);
      }
      if (auth.user?.id === userId) {
        auth.user.status = status;
      }
    });

    // === CHANNEL CRUD EVENTS ===
    socket.on('response:channels', (channels: Channel[]) => {
      channelsStore.setChannels(channels);
    });

    socket.on('channel:created', (channel: Channel) => {
      console.log('🆕 Channel created via WS:', channel.channelName);
      channelsStore.addChannel(channel);
      if (auth.user && channel.adminId === auth.user.id) {
        userChannelsStore.addUserToChannel(auth.user.id, channel.id);
      }
    });

    socket.on('channel:updated', (channel: Channel) => {
      channelsStore.updateChannelLocal(channel.id, channel.channelName, channel.isPublic);
    });

    socket.on('channel:deleted', (id: string) => {
      channelsStore.deleteChannelLocal(id);
    });

    // === MEMBERSHIP EVENTS ===
    socket.on(
      'member:joined',
      ({ userId, channelId, id }: { userId: number; channelId: string; id: string }) => {
        console.log(`🟢 member:joined user:${userId} -> channel:${channelId}`);
        userChannelsStore.addUserToChannel(userId, channelId, id);
      },
    );

    socket.on('member:left', ({ userId, channelId }: { userId: number; channelId: string }) => {
      console.log(`🔵 member:left user:${userId} <- channel:${channelId}`);
      userChannelsStore.removeUserFromChannel(userId, channelId);
    });

    socket.on(
      'member:invited',
      ({ userId, channelId, id }: { userId: number; channelId: string; id: string }) => {
        console.log(`🟢 member:invited user:${userId} -> channel:${channelId}`);
        userChannelsStore.addUserToChannel(userId, channelId, id);
      },
    );

    socket.on('member:kicked', ({ userId, channelId }: { userId: number; channelId: string }) => {
      console.log(`🔴 member:kicked user:${userId} from channel:${channelId}`);
      userChannelsStore.removeUserFromChannel(userId, channelId);
    });

    // === ERROR HANDLING ===
    socket.on('error:channel', (payload: { message: string }) => {
      console.warn('⚠️ Channel error:', payload.message);
    });
    socket.on('error:member', (payload: { message: string }) => {
      console.warn('⚠️ Member error:', payload.message);
    });
  }

  // === Auth watch ===
  auth.$subscribe((_, state) => {
    if (state.token && !socket) connectSocket();
    if (!state.token && socket) {
      console.log('🔴 Disconnecting socket (logout)...');
      socket.disconnect();
      socket = null;
    }
  });

  if (auth.token && !socket) connectSocket();
});

export { socket };
