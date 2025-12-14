import { useChannelsStore } from 'stores/channels';
import { useTabsStore } from 'stores/tabs';
import { useUserChannelsStore } from 'stores/user_channels';
import { useUserStore } from 'stores/user';
import { useAuthStore } from 'stores/auth';
import type { Channel } from 'src/types';

export function useChannelActions() {
  const channelsStore = useChannelsStore();
  const tabsStore = useTabsStore();
  const userChannelsStore = useUserChannelsStore();
  const userStore = useUserStore();
  const auth = useAuthStore();

  // === OPEN A CHANNEL IN TABS ===
  function openChannel(channel: Channel) {
    const existing = tabsStore.tabs.find((t) => t.id === channel.id);
    if (existing) {
      tabsStore.setActiveTab(existing.id);
    } else {
      tabsStore.addTab({
        id: channel.id,
        label: channel.channelName,
        content: `Welcome to #${channel.channelName}!`,
      });
      tabsStore.setActiveTab(channel.id);
    }

    if (channel.id) {
      userChannelsStore.joinChannel(channel.id);
    }
  }

  // === JOIN OR CREATE CHANNEL (via WS) ===
  function addOrGetChannel(name: string, isPublic = true) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Channel name required');

    // check local cache first
    const existing = channelsStore.channels.find((c) => c.channelName === trimmed);
    if (existing) {
      // Join channel if not already member
      userChannelsStore.joinChannel(existing.id);
      openChannel(existing);
      return existing;
    }

    // create new channel through WS
    channelsStore.createChannel(trimmed, !isPublic);
    console.log(`🆕 Requesting channel creation: ${trimmed}`);
    return null;
  }

  // === JOIN EXISTING CHANNEL BY NAME ===
  function joinChannelByName(name: string) {
    const channel = channelsStore.channels.find((c) => c.channelName === name);
    if (!channel) throw new Error(`Channel #${name} not found`);
    userChannelsStore.joinChannel(channel.id);
    openChannel(channel);
  }

  // === LEAVE CURRENT CHANNEL ===
  function cancelActiveChannel() {
    const activeId = tabsStore.activeTab?.id;
    if (!activeId) return null;

    const ch = channelsStore.channels.find((c) => c.id === activeId);
    if (!ch) return null;

    const uid = auth.user?.id;
    if (uid) {
      userChannelsStore.leaveChannel(activeId);
    }

    // If user is admin, delete channel
    if (ch.adminId === uid) {
      channelsStore.deleteChannel(activeId);
    }

    tabsStore.closeTab(activeId);
    return ch;
  }

  function quitActiveChannel() {
    const activeId = tabsStore.activeTab?.id;
    if (!activeId) return null;

    const ch = channelsStore.channels.find((c) => c.id === activeId);
    if (!ch) return null;

    const uid = auth.user?.id;

    if (ch.adminId === uid) {
      channelsStore.deleteChannel(activeId);
    }
    else throw new Error('Only channel admin can delete the channel');

    tabsStore.closeTab(activeId);
    return ch;
  }

  // === GET CURRENT CHANNEL ID ===
  function resolveChannelId(): string {
    const id = tabsStore.activeTab?.id;
    if (!id) throw new Error('No active channel selected');
    return id;
  }

  // === LIST CHANNEL MEMBERS (via store data) ===
  function listChannelMembers(): string[] {
    const cid = resolveChannelId();
    const memberIds = userChannelsStore.getUsersInChannel(cid);

    if (memberIds.length === 0) throw new Error('No users found in channel');

    const nicknames = memberIds
      .map((uid) => userStore.findUserById(uid)?.nickname)
      .filter((n): n is string => !!n);

    console.log(`👥 Members of #${cid}:`, nicknames);
    return nicknames;
  }

  // === INVITE USER TO CHANNEL ===
  function inviteUserToChannel(nickname: string) {
    const user = userStore.findUserByName(nickname);
    if (!user) throw new Error(`User ${nickname} not found`);

    const channelId = resolveChannelId();
    const alreadyIn = userChannelsStore.getChannelsForUser(user.id).includes(channelId);
    const channel = channelsStore.channels.find((c) => c.id === channelId);

    if (alreadyIn) throw new Error(`User ${nickname} is already in this channel`);
    const isOwner = channel?.adminId === auth.user?.id;
    if (isOwner) userChannelsStore.unbanUser(user.id, channelId);
    userChannelsStore.inviteUser(user.id, channelId);
    console.log(`✅ Invited ${nickname} to #${channelId}`);
  }

  // === KICK USER FROM CHANNEL ===
  function kickUserFromChannel(nickname: string): 'kicked' | 'voted' {
    const user = userStore.findUserByName(nickname);
    if (!user) throw new Error(`User ${nickname} not found`);

    const channelId = resolveChannelId();
    const inChannel = userChannelsStore.getChannelsForUser(user.id).includes(channelId);

    if (!inChannel) throw new Error(`User ${nickname} is not in this channel`);

    const channel = channelsStore.channels.find((c) => c.id === channelId);
    const isOwner = channel?.adminId === auth.user?.id;

    if (isOwner) {
      userChannelsStore.kickUser(user.id, channelId);
      console.log(`❌ Kicked ${nickname} from #${channelId}`);
      return 'kicked';
    } else {
      userChannelsStore.voteBanUser(user.id, channelId);
      console.log(`⚖️ Vote-ban triggered for ${nickname} in #${channelId}`);
      return 'voted';
    }
  }

  function revokeUserFromChannel(nickname: string) {
    const user = userStore.findUserByName(nickname);
    if (!user) throw new Error(`User ${nickname} not found`);

    const channelId = resolveChannelId();
    const inChannel = userChannelsStore.getChannelsForUser(user.id).includes(channelId);

    if (!inChannel) throw new Error(`User ${nickname} is not in this channel`);

    const channel = channelsStore.channels.find((c) => c.id === channelId);
    const isOwner = channel?.adminId === auth.user?.id;

    if (!isOwner) {
      throw new Error(`Only channel owner can revoke users`);
    }
    userChannelsStore.kickUser(user.id, channelId);
    console.log(`🔄 Revoked ${nickname} from #${channelId}`);
  }

  return {
    openChannel,
    addOrGetChannel,
    joinChannelByName,
    cancelActiveChannel,
    quitActiveChannel,
    listChannelMembers,
    inviteUserToChannel,
    kickUserFromChannel,
    revokeUserFromChannel,
  };
}
