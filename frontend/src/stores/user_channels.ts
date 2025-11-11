import { defineStore } from 'pinia';
import { ref } from 'vue';
import { socket } from 'boot/socket';
import type { UserChannel } from 'src/types/user_channel';

export const useUserChannelsStore = defineStore('userChannels', () => {
  const userChannels = ref<{ id: string; userId: number; channelId: string }[]>([]);

  function setUserChannels(newUserChannels: UserChannel[]) {
    userChannels.value = newUserChannels.map((uc) => ({
      id: uc.id,
      userId: uc.userId,
      channelId: uc.channelId,
    }));
  }

  function addUserToChannel(userId: number, channelId: string, id?: string) {
    const exists = userChannels.value.some(
      (uc) => uc.userId === userId && uc.channelId === channelId,
    );
    if (!exists) {
      userChannels.value.push({ id: id || crypto.randomUUID(), userId, channelId });
    }
  }

  function removeUserFromChannel(userId: number, channelId: string) {
    userChannels.value = userChannels.value.filter(
      (uc) => !(uc.userId === userId && uc.channelId === channelId),
    );
  }

  // === WebSocket actions ===
  function joinChannel(channelId: string) {
    socket?.emit('member:join', channelId);
  }

  function leaveChannel(channelId: string) {
    socket?.emit('member:leave', channelId);
  }

  function inviteUser(userId: number, channelId: string) {
    socket?.emit('member:invite', { userId, channelId });
  }

  function kickUser(targetId: number, channelId: string) {
    socket?.emit('member:kick', { targetId, channelId });
  }

  // === Listeners ===
  if (socket) {
    socket.on('member:joined', (payload: { userId: number; channelId: string; id: string }) => {
      addUserToChannel(payload.userId, payload.channelId, payload.id);
    });

    socket.on('member:left', ({ userId, channelId }) => {
      removeUserFromChannel(userId, channelId);
    });

    socket.on('member:invited', (payload: { userId: number; channelId: string; id: string }) => {
      addUserToChannel(payload.userId, payload.channelId, payload.id);
    });

    socket.on('member:kicked', ({ userId, channelId }) => {
      removeUserFromChannel(userId, channelId);
    });
  }

  return {
    userChannels,
    setUserChannels,
    addUserToChannel,
    removeUserFromChannel,
    joinChannel,
    leaveChannel,
    inviteUser,
    kickUser,
    getChannelsForUser: (userId: number) =>
      userChannels.value.filter((uc) => uc.userId === userId).map((uc) => uc.channelId),
    getUsersInChannel: (channelId: string) =>
      userChannels.value.filter((uc) => uc.channelId === channelId).map((uc) => uc.userId),
  };
});

export type UserChannelsStore = ReturnType<typeof useUserChannelsStore>;
