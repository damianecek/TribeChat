import type { Socket, Server } from 'socket.io'
import { ChannelService } from '#services/channel.service'
import { MemberService } from '#services/member.service'

export class ChannelHandler {
  constructor(
    private channelService: ChannelService,
    private memberService: MemberService,
    private io: Server
  ) {}

  /**
   * Register all channel-related event handlers
   */
  register(socket: Socket, userId: number): void {
    socket.on('request:channels', () => this.handleRequestChannels(socket))
    socket.on('channel:create', (data) => this.handleCreateChannel(socket, userId, data))
    socket.on('channel:update', (data) => this.handleUpdateChannel(socket, userId, data))
    socket.on('channel:delete', (channelId) => this.handleDeleteChannel(socket, userId, channelId))
  }

  /**
   * Handle request for all channels
   */
  private async handleRequestChannels(socket: Socket): Promise<void> {
    try {
      const channels = await this.channelService.getAllChannels()
      socket.emit('response:channels', channels)
    } catch (err) {
      console.error('❌ Request channels error:', err)
    }
  }

  /**
   * Handle channel creation
   */
  private async handleCreateChannel(
    socket: Socket,
    userId: number,
    data: { name: string; isPublic: boolean }
  ): Promise<void> {
    try {
      const channel = await this.channelService.createChannel(data.name, data.isPublic, userId)
      socket.join(`channel:${channel.id}`)
      this.io.emit('channel:created', channel)
      console.log(`🟢 Channel created: ${data.name} by ${userId}`)
    } catch (err: any) {
      console.error('❌ Channel creation error:', err)
      socket.emit('error:channel', { message: err.message || 'Channel creation failed.' })
    }
  }

  /**
   * Handle channel update
   */
  private async handleUpdateChannel(
    socket: Socket,
    userId: number,
    data: { id: string; name: string; isPublic: boolean }
  ): Promise<void> {
    try {
      const channel = await this.channelService.updateChannel(
        data.id,
        userId,
        data.name,
        data.isPublic
      )
      this.io.emit('channel:updated', channel)
      console.log(`🟡 Channel updated: ${channel.channelName}`)
    } catch (err: any) {
      console.error('❌ Channel update error:', err)
      socket.emit('error:channel', { message: err.message || 'Channel update failed.' })
    }
  }

  /**
   * Handle channel deletion
   */
  private async handleDeleteChannel(
    socket: Socket,
    userId: number,
    channelId: string
  ): Promise<void> {
    try {
      await this.channelService.deleteChannel(channelId, userId)
      this.memberService.clearChannelInvites(channelId)
      this.memberService.clearChannelBanVotes(channelId)
      this.io.emit('channel:deleted', channelId)
      console.log(`🔴 Channel deleted: ${channelId}`)
    } catch (err: any) {
      console.error('❌ Channel delete error:', err)
      socket.emit('error:channel', { message: err.message || 'Channel deletion failed.' })
    }
  }
}
