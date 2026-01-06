import UserChannel from '#models/user_channel'
import Blacklist from '#models/blacklist'
import Channel from '#models/channel'

export interface BanVoteData {
  votes: number
  threshold: number
  shouldBan: boolean
}

export class MemberService {
  private pendingInvites: Map<number, Set<string>> = new Map()
  private banVotes: Map<string, Set<number>> = new Map()

  private readonly BAN_VOTE_MIN_THRESHOLD = 3

  private banVoteKey(channelId: string, targetId: number): string {
    return `${channelId}:${targetId}`
  }

  /**
   * Add a pending invitation for a user
   */
  addPendingInvite(userId: number, channelId: string): void {
    const existing = this.pendingInvites.get(userId) || new Set<string>()
    existing.add(channelId)
    this.pendingInvites.set(userId, existing)
  }

  /**
   * Clear a pending invitation
   */
  clearPendingInvite(userId: number, channelId: string): void {
    const existing = this.pendingInvites.get(userId)
    if (!existing) return
    existing.delete(channelId)
    if (existing.size === 0) this.pendingInvites.delete(userId)
  }

  /**
   * Check if user has a pending invitation
   */
  isInvited(userId: number, channelId: string): boolean {
    return this.pendingInvites.get(userId)?.has(channelId) ?? false
  }

  /**
   * Clear all pending invites for a channel
   */
  clearChannelInvites(channelId: string): void {
    this.pendingInvites.forEach((set, userId) => {
      set.delete(channelId)
      if (set.size === 0) this.pendingInvites.delete(userId)
    })
  }

  /**
   * Get all pending invites for a user
   */
  getPendingInvites(userId: number): Set<string> {
    return this.pendingInvites.get(userId) || new Set<string>()
  }

  /**
   * Join a user to a channel
   */
  async joinChannel(userId: number, channelId: string): Promise<UserChannel> {
    const channel = await Channel.find(channelId)
    if (!channel) {
      throw new Error('Channel not found.')
    }

    const isBanned = await Blacklist.query()
      .where('user_id', userId)
      .andWhere('channel_id', channelId)
      .andWhere('is_permanent', true)
      .first()

    if (isBanned) {
      throw new Error('You are banned from this channel.')
    }

    const existing = await UserChannel.query()
      .where('user_id', userId)
      .andWhere('channel_id', channelId)
      .first()

    if (existing) {
      return existing
    }

    if (!channel.isPublic && channel.adminId !== userId && !this.isInvited(userId, channelId)) {
      throw new Error('Invite required to join this private channel.')
    }

    const newLink = await UserChannel.create({
      userId,
      channelId,
    })

    this.clearPendingInvite(userId, channelId)
    return newLink
  }

  /**
   * Remove a user from a channel
   */
  async leaveChannel(userId: number, channelId: string): Promise<void> {
    await UserChannel.query().where('user_id', userId).andWhere('channel_id', channelId).delete()
  }

  /**
   * Invite a user to a channel
   */
  async inviteUser(inviterId: number, invitedId: number, channelId: string): Promise<void> {
    const channel = await Channel.find(channelId)
    if (!channel) {
      throw new Error('Channel not found.')
    }

    if (channel.adminId !== inviterId && channel.isPublic === false) {
      throw new Error('Not authorized to invite.')
    }

    const isBanned = await Blacklist.query()
      .where('user_id', invitedId)
      .andWhere('channel_id', channelId)
      .andWhere('is_permanent', true)
      .first()

    if (isBanned) {
      throw new Error('User is banned from this channel.')
    }

    const exists = await UserChannel.query()
      .where('user_id', invitedId)
      .andWhere('channel_id', channelId)
      .first()

    if (exists) {
      throw new Error('User already in channel.')
    }

    this.addPendingInvite(invitedId, channelId)
  }

  /**
   * Kick a user from a channel
   */
  async kickUser(adminId: number, targetId: number, channelId: string): Promise<void> {
    const channel = await Channel.find(channelId)
    if (!channel) {
      throw new Error('Channel not found.')
    }

    if (channel.adminId !== adminId) {
      throw new Error('Not authorized to kick.')
    }

    await UserChannel.query().where('user_id', targetId).andWhere('channel_id', channelId).delete()
    this.clearPendingInvite(targetId, channelId)
  }

  /**
   * Ban a user from a channel (admin action)
   */
  async banUser(adminId: number, targetId: number, channelId: string): Promise<void> {
    const channel = await Channel.find(channelId)
    if (!channel) {
      throw new Error('Channel not found.')
    }

    if (channel.adminId !== adminId) {
      throw new Error('Not authorized to ban.')
    }

    if (channel.adminId === targetId) {
      throw new Error('Cannot ban the channel owner.')
    }

    await this.finalizeBan(targetId, channelId)
  }

  /**
   * Unban a user from a channel
   */
  async unbanUser(adminId: number, targetId: number, channelId: string): Promise<void> {
    const channel = await Channel.find(channelId)
    if (!channel) {
      throw new Error('Channel not found.')
    }

    if (channel.adminId !== adminId) {
      throw new Error('Not authorized to unban.')
    }

    await Blacklist.query().where('user_id', targetId).andWhere('channel_id', channelId).delete()

    this.banVotes.delete(this.banVoteKey(channelId, targetId))
  }

  /**
   * Vote to ban a user
   */
  async voteBan(voterId: number, targetId: number, channelId: string): Promise<BanVoteData> {
    if (targetId === voterId) {
      throw new Error('Cannot vote to ban yourself.')
    }

    const channel = await Channel.find(channelId)
    if (!channel) {
      throw new Error('Channel not found.')
    }

    if (channel.adminId === targetId) {
      throw new Error('Cannot ban the channel owner.')
    }

    const targetMembership = await UserChannel.query()
      .where('user_id', targetId)
      .andWhere('channel_id', channelId)
      .first()

    if (!targetMembership) {
      throw new Error('Target is not a channel member.')
    }

    const key = this.banVoteKey(channelId, targetId)
    const voters = this.banVotes.get(key) || new Set<number>()
    voters.add(voterId)
    this.banVotes.set(key, voters)

    const memberCountResult = await UserChannel.query()
      .where('channel_id', channelId)
      .count('* as total')
    const memberCountRow = memberCountResult[0]
    const memberCount = Number(memberCountRow.$extras?.total ?? memberCountRow.total ?? 0)
    const threshold = Math.max(this.BAN_VOTE_MIN_THRESHOLD, Math.ceil(memberCount / 2))

    const votes = voters.size
    const shouldBan = votes >= threshold

    if (shouldBan) {
      await this.finalizeBan(targetId, channelId)
    }

    return { votes, threshold, shouldBan }
  }

  /**
   * Finalize a ban (permanent)
   */
  async finalizeBan(targetId: number, channelId: string): Promise<void> {
    await Blacklist.updateOrCreate({ userId: targetId, channelId }, { isPermanent: true })
    await UserChannel.query().where('user_id', targetId).andWhere('channel_id', channelId).delete()
    this.banVotes.delete(this.banVoteKey(channelId, targetId))
    this.clearPendingInvite(targetId, channelId)
  }

  /**
   * Clear all ban votes for a channel
   */
  clearChannelBanVotes(channelId: string): void {
    this.banVotes.forEach((_, key) => {
      if (key.startsWith(`${channelId}:`)) this.banVotes.delete(key)
    })
  }

  /**
   * Get all permanent bans
   */
  async getAllBans(): Promise<Array<{ userId: number; channelId: string; isPermanent: boolean }>> {
    const allBans = await Blacklist.query().where('is_permanent', true)
    return allBans.map((ban) => ({
      userId: ban.userId,
      channelId: ban.channelId,
      isPermanent: ban.isPermanent,
    }))
  }

  /**
   * Get user channels for a specific user
   */
  async getUserChannels(userId: number): Promise<UserChannel[]> {
    return await UserChannel.query().where('user_id', userId)
  }
}
