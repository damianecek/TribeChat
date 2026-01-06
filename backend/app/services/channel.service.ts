import Channel from '#models/channel'
import UserChannel from '#models/user_channel'
import Blacklist from '#models/blacklist'
import { DateTime } from 'luxon'

export class ChannelService {
  /**
   * Create a new channel
   */
  async createChannel(name: string, isPublic: boolean, adminId: number): Promise<Channel> {
    const exists = await Channel.findBy('channel_name', name)
    if (exists) {
      throw new Error('Channel name already exists.')
    }

    const channel = await Channel.create({
      channelName: name,
      isPublic,
      adminId,
      lastMessage: DateTime.local(),
    })

    await UserChannel.create({
      userId: adminId,
      channelId: channel.id,
    })

    return channel
  }

  /**
   * Update an existing channel
   */
  async updateChannel(
    channelId: string,
    userId: number,
    name: string,
    isPublic: boolean
  ): Promise<Channel> {
    const channel = await Channel.find(channelId)
    if (!channel) {
      throw new Error('Channel not found.')
    }

    if (channel.adminId !== userId) {
      throw new Error('Not authorized to update this channel.')
    }

    channel.channelName = name
    channel.isPublic = isPublic
    channel.updatedAt = DateTime.local()
    await channel.save()

    return channel
  }

  /**
   * Delete a channel and all related data
   */
  async deleteChannel(channelId: string, userId: number): Promise<void> {
    const channel = await Channel.find(channelId)
    if (!channel) {
      throw new Error('Channel not found.')
    }

    if (channel.adminId !== userId) {
      throw new Error('Not authorized to delete this channel.')
    }

    await Blacklist.query().where('channel_id', channelId).delete()
    await UserChannel.query().where('channel_id', channelId).delete()
    await channel.delete()
  }

  /**
   * Get all channels
   */
  async getAllChannels(): Promise<Channel[]> {
    return await Channel.all()
  }

  /**
   * Update last message timestamp for a channel
   */
  async updateLastMessage(channelId: string): Promise<void> {
    await Channel.query().where('id', channelId).update({ lastMessage: DateTime.local() })
  }

  /**
   * Get inactive channels older than specified days
   */
  async getInactiveChannels(days: number): Promise<Channel[]> {
    const cutoff = DateTime.now().minus({ days })
    try {
      return await Channel.query()
        .where('last_message', '<', cutoff.toJSDate())
        .orWhereNull('last_message')
    } catch (err: any) {
      // During migrations the table may not exist yet
      if (err?.code !== '42P01') {
        throw err
      }
      return []
    }
  }
}
