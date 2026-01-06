import type { Socket, Server } from 'socket.io'
import { MessageService } from '#services/message.service'
import { ChannelService } from '#services/channel.service'

export class MessageHandler {
  constructor(
    private messageService: MessageService,
    private channelService: ChannelService,
    private io: Server
  ) {}

  /**
   * Register all message-related event handlers
   */
  register(socket: Socket, userId: number): void {
    socket.on('message:send', (data) => this.handleSendMessage(socket, userId, data))
    socket.on('message:fetch', (data) => this.handleFetchMessages(socket, userId, data))
    socket.on('message:delete', (id) => this.handleDeleteMessage(socket, userId, id))
    socket.on('message:update', (data) => this.handleUpdateMessage(socket, userId, data))
  }

  /**
   * Handle sending a message
   */
  private async handleSendMessage(
    socket: Socket,
    userId: number,
    data: { channelId: string; content: string }
  ): Promise<void> {
    try {
      const message = await this.messageService.sendMessage(userId, data.channelId, data.content)
      await this.channelService.updateLastMessage(data.channelId)

      const room = this.io.sockets.adapter.rooms.get(`channel:${data.channelId}`)
      console.log('📡 Broadcast recipients for message:', {
        channel: `channel:${data.channelId}`,
        receivers: room ? [...room] : [],
      })

      this.io.to(`channel:${data.channelId}`).emit('message:new', {
        id: message.id,
        channelId: message.channelId,
        authorId: message.authorId,
        author: message.author,
        content: message.content,
        createdAt: message.createdAt,
      })

      console.log(`💬 User ${userId} sent message in channel ${data.channelId}`)
    } catch (err: any) {
      console.error('❌ message:send error', err)
      socket.emit('error:message', { message: err.message || 'Failed to send message' })
    }
  }

  /**
   * Handle fetching messages with pagination
   */
  private async handleFetchMessages(
    socket: Socket,
    userId: number,
    data: { channelId: string; beforeId?: string; limit?: number }
  ): Promise<void> {
    try {
      const messages = await this.messageService.fetchMessages(
        userId,
        data.channelId,
        data.beforeId,
        data.limit || 50
      )
      socket.emit('message:list', messages)
      console.log(
        `📜 Sent ${messages.length} messages for channel ${data.channelId} ${
          data.beforeId ? `before ${data.beforeId}` : '(latest batch)'
        }`
      )
    } catch (err: any) {
      console.error('❌ message:fetch error', err)
      socket.emit('error:message', { message: err.message || 'Failed to fetch messages' })
    }
  }

  /**
   * Handle deleting a message
   */
  private async handleDeleteMessage(
    socket: Socket,
    userId: number,
    messageId: string
  ): Promise<void> {
    try {
      const result = await this.messageService.deleteMessage(userId, messageId)
      this.io.to(`channel:${result.channelId}`).emit('message:deleted', { id: result.id })
      console.log(`🗑️ Message ${messageId} deleted by user ${userId}`)
    } catch (err: any) {
      console.error('❌ message:delete error', err)
      socket.emit('error:message', { message: err.message || 'Failed to delete message' })
    }
  }

  /**
   * Handle updating a message
   */
  private async handleUpdateMessage(
    socket: Socket,
    userId: number,
    data: { id: string; content: string }
  ): Promise<void> {
    try {
      const msg = await this.messageService.updateMessage(userId, data.id, data.content)
      this.io.to(`channel:${msg.channelId}`).emit('message:updated', msg)
      console.log(`✏️ Message ${data.id} updated`)
    } catch (err: any) {
      console.error('❌ message:update error', err)
      socket.emit('error:message', { message: err.message || 'Failed to update message' })
    }
  }
}
