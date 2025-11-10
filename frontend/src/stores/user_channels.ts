import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import type { UserChannel } from 'src/types/user_channel';

export const useUserChannelsStore = defineStore('userChannels', () => {
  const auth = useAuthStore();
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
      userChannels.value.push({
        id: id || crypto.randomUUID(),
        userId,
        channelId,
      });
    }
  }

  function removeUserFromChannel(userId: number, channelId: string) {
    userChannels.value = userChannels.value.filter(
      (uc) => !(uc.userId === userId && uc.channelId === channelId),
    );
  }

  async function joinChannel(channelId: string) {
    if (!auth.user) return;

    try {
      const res = await fetch('http://localhost:3333/user-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          userId: auth.user.id,
          channelId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addUserToChannel(data.userId, data.channelId, data.id);
      } else {
        console.error('Join failed:', await res.text());
      }
    } catch (err) {
      console.error('Join error:', err);
    }
  }

  async function leaveChannel(channelId: string) {
    if (!auth.user) return;

    const link = userChannels.value.find(
      (uc) => uc.userId === auth.user!.id && uc.channelId === channelId,
    );
    if (!link) return;

    try {
      const res = await fetch(`http://localhost:3333/user-channels/${link.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (res.ok) {
        removeUserFromChannel(auth.user.id, channelId);
      } else {
        console.error('Leave failed:', await res.text());
      }
    } catch (err) {
      console.error('Leave error:', err);
    }
  }

  async function inviteUser(userId: number, channelId: string) {
    try {
      const res = await fetch('http://localhost:3333/user-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ userId, channelId }),
      });
      if (!res.ok) console.error('Invite failed:', await res.text());
    } catch (err) {
      console.error('Invite error:', err);
    }
  }

  async function kickUser(userId: number, channelId: string) {
    const link = userChannels.value.find(
      (uc) => uc.userId === userId && uc.channelId === channelId,
    );
    if (!link) return;

    try {
      const res = await fetch(`http://localhost:3333/user-channels/${link.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (!res.ok) console.error('Kick failed:', await res.text());
    } catch (err) {
      console.error('Kick error:', err);
    }
  }

  return {
    userChannels,
    setUserChannels,
    addUserToChannel,
    removeUserFromChannel,
    getChannelsForUser: (userId: number) =>
      userChannels.value.filter((uc) => uc.userId === userId).map((uc) => uc.channelId),
    getUsersInChannel: (channelId: string) =>
      userChannels.value.filter((uc) => uc.channelId === channelId).map((uc) => uc.userId),

    // nové API
    joinChannel,
    leaveChannel,
    inviteUser,
    kickUser,
  };
});

export type UserChannelsStore = ReturnType<typeof useUserChannelsStore>;
