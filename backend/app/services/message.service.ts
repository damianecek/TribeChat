import Message from '#models/message'
import UserChannel from '#models/user_channel'
import Blacklist from '#models/blacklist'

export class MessageService {
  /**
   * Send a message to a channel
   */
  async sendMessage(userId: number, channelId: string, content: string): Promise<Message> {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty.')
    }

    const membership = await UserChannel.query()
      .where('user_id', userId)
      .andWhere('channel_id', channelId)
      .first()

    if (!membership) {
      throw new Error('Join the channel before sending messages.')
    }

    const isBanned = await Blacklist.query()
      .where('user_id', userId)
      .andWhere('channel_id', channelId)
      .andWhere('is_permanent', true)
      .first()

    if (isBanned) {
      throw new Error('You are banned from this channel.')
    }

    const message = await Message.create({
      channelId,
      authorId: userId,
      content,
    })

    await message.load('author')
    return message
  }

  /**
   * Fetch messages from a channel with pagination
   */
  async fetchMessages(
    userId: number,
    channelId: string,
    beforeId?: string,
    limit: number = 50
  ): Promise<Message[]> {
    const membership = await UserChannel.query()
      .where('user_id', userId)
      .andWhere('channel_id', channelId)
      .first()

    if (!membership) {
      throw new Error('Join the channel to view messages.')
    }

    let query = Message.query()
      .where('channel_id', channelId)
      .preload('author')
      .orderBy('created_at', 'desc')

    if (beforeId) {
      const beforeMessage = await Message.find(beforeId)
      if (beforeMessage) {
        query = query.where('created_at', '<', beforeMessage.createdAt.toJSDate())
      }
    }

    const messages = await query.limit(limit)
    return messages.reverse()
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    userId: number,
    messageId: string
  ): Promise<{ id: string; channelId: string }> {
    const msg = await Message.find(messageId)
    if (!msg) {
      throw new Error('Message not found.')
    }

    if (msg.authorId !== userId) {
      throw new Error('Not authorized to delete this message.')
    }

    const channelId = msg.channelId
    await msg.delete()
    return { id: messageId, channelId }
  }

  /**
   * Update a message
   */
  async updateMessage(userId: number, messageId: string, content: string): Promise<Message> {
    const msg = await Message.find(messageId)
    if (!msg) {
      throw new Error('Message not found.')
    }

    if (msg.authorId !== userId) {
      throw new Error('Not authorized to edit this message.')
    }

    msg.content = content
    await msg.save()
    return msg
  }
}
