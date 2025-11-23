import { defineStore } from 'pinia';
import { ref } from 'vue';
import { socket } from 'boot/socket';
import type { UserChannel, NotificationSetting } from 'src/types';

export const useUserChannelsStore = defineStore('userChannels', () => {
  const userChannels = ref<{ id: string; userId: number; channelId: string, hasUnread: boolean, notificationSetting: NotificationSetting}[]>([]);

  function setUserChannels(newUserChannels: UserChannel[]) {
    userChannels.value = newUserChannels.map((uc) => ({
      id: uc.id,
      userId: uc.userId,
      channelId: uc.channelId,
      hasUnread: false,
      notificationSetting: 'all' as NotificationSetting
    }));
  }

  function addUserToChannel(userId: number, channelId: string, id?: string) {
    const exists = userChannels.value.some(
      (uc) => uc.userId === userId && uc.channelId === channelId,
    );
    if (!exists) {
      userChannels.value.push({ id: id || crypto.randomUUID(), userId, channelId, hasUnread: false, notificationSetting: 'all' as NotificationSetting });
    }
  }

  function removeUserFromChannel(userId: number, channelId: string) {
    userChannels.value = userChannels.value.filter(
      (uc) => !(uc.userId === userId && uc.channelId === channelId),
    );
  }

  function markUnread(channelId: string, userId: number) {
    const channel = userChannels.value.find(
      c => c.channelId === channelId && c.userId === userId
    );

    if (channel) {
      channel.hasUnread = true;
    }
  }

  function clearUnread(channelId: string, userId: number) {
    const channel = userChannels.value.find(
      c => c.channelId === channelId && c.userId === userId
    );

    if (channel) {
      channel.hasUnread = false;
    }
  }

  function changeNotificationSetting(channelId: string, userId: number, setting: NotificationSetting) {
    const channel = userChannels.value.find(
      c => c.channelId === channelId && c.userId === userId
    );

    if (channel) {
      channel.notificationSetting = setting;
    }
  }

  function getNotificationSetting(channelId: string, userId: number): NotificationSetting | null {
    const channel = userChannels.value.find(
      c => c.channelId === channelId && c.userId === userId
    );

    return channel ? channel.notificationSetting : null;
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
    markUnread,
    clearUnread,
    changeNotificationSetting,
    getNotificationSetting,
    getChannelsForUser: (userId: number) =>
      userChannels.value.filter((uc) => uc.userId === userId).map((uc) => uc.channelId),
    getUsersInChannel: (channelId: string) =>
      userChannels.value.filter((uc) => uc.channelId === channelId).map((uc) => uc.userId),
  };
});

export type UserChannelsStore = ReturnType<typeof useUserChannelsStore>;
