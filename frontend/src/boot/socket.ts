import { boot } from 'quasar/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAuthStore } from 'src/stores/auth';
import { useChannelsStore } from 'stores/channels';
import { useUserChannelsStore } from 'stores/user_channels';
import { useUserStore } from 'stores/user';
import { useMessagesStore } from 'stores/messages';
import type { Channel, UserStatus } from 'src/types';

let socket: Socket | null = null;

export default boot(() => {
  const auth = useAuthStore();
  const channelsStore = useChannelsStore();
  const userChannelsStore = useUserChannelsStore();
  const userStore = useUserStore();
  const messagesStore = useMessagesStore();

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

    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 WS disconnected:', reason);
      socket = null;
    });

    messagesStore.initSocketListeners();

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

    socket.on('user:created', (user) => {
      userStore.addUser(user);
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
        if (auth.user && userId === auth.user.id) {
          userChannelsStore.removeInvitation(channelId, userId);
        }
      },
    );

    socket.on('member:left', ({ userId, channelId }: { userId: number; channelId: string }) => {
      console.log(`🔵 member:left user:${userId} <- channel:${channelId}`);
      userChannelsStore.removeUserFromChannel(userId, channelId);
    });

    socket.on(
      'member:invited',
      ({ userId, channelId, invitedBy }: { userId: number; channelId: string; invitedBy?: number }) => {
        if (auth.user?.id !== userId) return;
        console.log(`🟢 member:invited user:${userId} -> channel:${channelId}`);
        userChannelsStore.addInvitation(channelId, userId, invitedBy);
      },
    );

    socket.on('member:kicked', ({ userId, channelId }: { userId: number; channelId: string }) => {
      console.log(`🔴 member:kicked user:${userId} from channel:${channelId}`);
      userChannelsStore.removeUserFromChannel(userId, channelId);
    });

    socket.on(
      'member:banned',
      ({ userId, channelId, isPermanent }: { userId: number; channelId: string; isPermanent: boolean }) => {
        console.log(`⛔ member:banned user:${userId} from channel:${channelId}`);
        userChannelsStore.removeUserFromChannel(userId, channelId);
        userChannelsStore.addBan(userId, channelId, isPermanent);
        if (auth.user && userId === auth.user.id) {
          userChannelsStore.removeInvitation(channelId, userId);
        }
      }
    );

    socket.on('member:unbanned', ({ userId, channelId }: { userId: number; channelId: string }) => {
      console.log(`✅ member:unbanned user:${userId} from channel:${channelId}`);
      userChannelsStore.removeBan(userId, channelId);
    });

    socket.on(
      'member:banVote',
      ({ userId, channelId, votes, threshold }: { userId: number; channelId: string; votes: number; threshold: number }) => {
        console.log(`⚖️ Vote ban update for user:${userId} channel:${channelId} votes:${votes}/${threshold}`);
      }
    );

    socket.on('member:invitationCleared', ({ channelId }: { channelId: string }) => {
      const currentUserId = auth.user?.id;
      if (!currentUserId) return;
      userChannelsStore.removeInvitation(channelId, currentUserId);
    });

    socket.on(
      'member:banned:init',
      (list: { userId: number; channelId: string; isPermanent: boolean }[]) => {
        userChannelsStore.setBans(list);
      }
    );

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
    if (state.token && !socket && auth.user?.status !== 'Offline') connectSocket();
    if (!state.token && socket) {
      messagesStore.cleanup();
      console.log('🔴 Disconnecting socket (logout)...');
      socket.disconnect();
      socket = null;
    }
    if (socket && auth.user?.status === 'Offline' ) {
      console.log('🔴 Disconnecting socket (set offline)...');
      socket.disconnect();
      socket = null;
    }
  });

  if (auth.token && !socket) connectSocket();
});

export { socket };
