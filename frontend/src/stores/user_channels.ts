import { defineStore } from 'pinia';
import { ref } from 'vue';
import { socket } from 'boot/socket';
import type { UserChannel, NotificationSetting } from 'src/types';

export const useUserChannelsStore = defineStore('userChannels', () => {
  const userChannels = ref<{ id: string; userId: number; channelId: string, hasUnread: boolean, notificationSetting: NotificationSetting}[]>([]);
  const invitations = ref<{ channelId: string; userId: number; invitedBy?: number }[]>([]);
  const bans = ref<{ channelId: string; userId: number; isPermanent: boolean }[]>([]);

  function setUserChannels(newUserChannels: UserChannel[]) {
    if (newUserChannels.length === 0) {
      userChannels.value = [];
      invitations.value = [];
      bans.value = [];
      return;
    }

    userChannels.value = newUserChannels.map((uc) => ({
      id: uc.id,
      userId: uc.userId,
      channelId: uc.channelId,
      hasUnread: false,
      notificationSetting: 'all' as NotificationSetting
    }));

    invitations.value = invitations.value.filter(
      (inv) => !newUserChannels.some((uc) => uc.userId === inv.userId && uc.channelId === inv.channelId)
    );
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

  function addInvitation(channelId: string, userId: number, invitedBy?: number) {
    const exists = invitations.value.some(
      (inv) => inv.channelId === channelId && inv.userId === userId
    );
    if (exists) return;

    const payload: { channelId: string; userId: number; invitedBy?: number } =
      invitedBy !== undefined
        ? { channelId, userId, invitedBy }
        : { channelId, userId };

    invitations.value.push(payload);
  }

  function removeInvitation(channelId: string, userId: number) {
    invitations.value = invitations.value.filter(
      (inv) => !(inv.channelId === channelId && inv.userId === userId)
    );
  }

  function getInvitationsForUser(userId: number) {
    return invitations.value.filter((inv) => inv.userId === userId);
  }

  function addBan(userId: number, channelId: string, isPermanent: boolean) {
    const exists = bans.value.some(
      (ban) => ban.channelId === channelId && ban.userId === userId
    );
    if (!exists) {
      bans.value.push({ userId, channelId, isPermanent });
    }
  }

  function setBans(list: { userId: number; channelId: string; isPermanent: boolean }[]) {
    bans.value = list
  }

  function removeBan(userId: number, channelId: string) {
    bans.value = bans.value.filter(
      (ban) => !(ban.userId === userId && ban.channelId === channelId)
    );
  }

  function isBanned(userId: number, channelId: string) {
    return bans.value.some((ban) => ban.userId === userId && ban.channelId === channelId);
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

  function acceptInvite(channelId: string) {
    socket?.emit('member:join', channelId);
  }

  function declineInvite(channelId: string) {
    socket?.emit('member:declineInvite', channelId);
  }

  function banUser(targetId: number, channelId: string) {
    socket?.emit('member:ban', { targetId, channelId });
  }

  function voteBanUser(targetId: number, channelId: string) {
    socket?.emit('member:voteBan', { targetId, channelId });
  }

  function unbanUser(targetId: number, channelId: string) {
    socket?.emit('member:unban', { targetId, channelId });
  }

  return {
    userChannels,
    invitations,
    bans,
    setUserChannels,
    addUserToChannel,
    removeUserFromChannel,
    addInvitation,
    removeInvitation,
    getInvitationsForUser,
    addBan,
    removeBan,
    isBanned,
    setBans,
    joinChannel,
    leaveChannel,
    inviteUser,
    kickUser,
    acceptInvite,
    declineInvite,
    banUser,
    voteBanUser,
    unbanUser,
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
