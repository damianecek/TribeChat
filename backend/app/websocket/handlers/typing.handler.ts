import type { Socket } from 'socket.io'
import User from '#models/user'
import UserChannel from '#models/user_channel'

export class TypingHandler {
  /**
   * Register all typing-related event handlers
   */
  register(socket: Socket, userId: number): void {
    socket.on('typing:start', (data) => this.handleTypingStart(socket, userId, data))
    socket.on('typing:draft', (data) => this.handleTypingDraft(socket, userId, data))
    socket.on('typing:stop', (data) => this.handleTypingStop(socket, userId, data))
  }

  /**
   * Handle typing start event
   */
  private async handleTypingStart(
    socket: Socket,
    userId: number,
    data: { channelId: string; draft?: string }
  ): Promise<void> {
    try {
      const membership = await UserChannel.query()
        .where('user_id', userId)
        .andWhere('channel_id', data.channelId)
        .first()

      if (!membership) {
        socket.emit('error:typing', { message: 'Join the channel to type.' })
        return
      }

      const user = await User.find(userId)
      const nickname = user?.nickname

      socket.broadcast.emit(`typing:start:${data.channelId}`, {
        userId,
        username: nickname,
        channelId: data.channelId,
        draft: data.draft,
      })

      console.log(`⌨️ ${nickname} is typing in channel ${data.channelId}`)
    } catch (err) {
      console.error('❌ typing:start error', err)
    }
  }

  /**
   * Handle typing draft update
   */
  private async handleTypingDraft(
    socket: Socket,
    userId: number,
    data: { channelId: string; draft: string }
  ): Promise<void> {
    try {
      const membership = await UserChannel.query()
        .where('user_id', userId)
        .andWhere('channel_id', data.channelId)
        .first()

      if (!membership) return

      const user = await User.find(userId)
      const nickname = user?.nickname

      socket.broadcast.emit(`typing:draft:${data.channelId}`, {
        userId,
        username: nickname,
        channelId: data.channelId,
        draft: data.draft,
      })
    } catch (err) {
      console.error('❌ typing:draft error', err)
    }
  }

  /**
   * Handle typing stop event
   */
  private async handleTypingStop(
    socket: Socket,
    userId: number,
    data: { channelId: string }
  ): Promise<void> {
    try {
      const membership = await UserChannel.query()
        .where('user_id', userId)
        .andWhere('channel_id', data.channelId)
        .first()

      if (!membership) {
        socket.emit('error:typing', { message: 'Join the channel first.' })
        return
      }

      const user = await User.find(userId)
      const nickname = user?.nickname

      socket.broadcast.emit(`typing:stop:${data.channelId}`, {
        userId,
        username: nickname,
        channelId: data.channelId,
      })

      console.log(`🛑 ${nickname} stopped typing in channel ${data.channelId}`)
    } catch (err) {
      console.error('❌ typing:stop error', err)
    }
  }
}
