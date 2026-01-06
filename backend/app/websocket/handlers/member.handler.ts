import type { Socket, Server } from 'socket.io'
import { MemberService } from '#services/member.service'

export class MemberHandler {
  constructor(
    private memberService: MemberService,
    private io: Server
  ) {}

  /**
   * Register all member-related event handlers
   */
  register(socket: Socket, userId: number): void {
    socket.on('member:join', (channelId) => this.handleJoinChannel(socket, userId, channelId))
    socket.on('member:leave', (channelId) => this.handleLeaveChannel(socket, userId, channelId))
    socket.on('member:invite', (data) => this.handleInviteUser(socket, userId, data))
    socket.on('member:declineInvite', (channelId) =>
      this.handleDeclineInvite(socket, userId, channelId)
    )
    socket.on('member:kick', (data) => this.handleKickUser(socket, userId, data))
    socket.on('member:ban', (data) => this.handleBanUser(socket, userId, data))
    socket.on('member:unban', (data) => this.handleUnbanUser(socket, userId, data))
    socket.on('member:voteBan', (data) => this.handleVoteBan(socket, userId, data))
  }

  /**
   * Handle joining a channel
   */
  private async handleJoinChannel(
    socket: Socket,
    userId: number,
    channelId: string
  ): Promise<void> {
    try {
      const newLink = await this.memberService.joinChannel(userId, channelId)
      socket.join(`channel:${channelId}`)
      this.io.emit('member:joined', { userId, channelId, id: newLink.id })
      console.log(`🟢 User ${userId} joined channel ${channelId}`)
    } catch (err: any) {
      console.error('❌ Member join error:', err)
      socket.emit('error:member', { message: err.message || 'Failed to join channel.' })
    }
  }

  /**
   * Handle leaving a channel
   */
  private async handleLeaveChannel(
    socket: Socket,
    userId: number,
    channelId: string
  ): Promise<void> {
    try {
      await this.memberService.leaveChannel(userId, channelId)
      socket.leave(`channel:${channelId}`)
      this.io.emit('member:left', { userId, channelId })
      console.log(`🔵 User ${userId} left channel ${channelId}`)
    } catch (err: any) {
      console.error('❌ Member leave error:', err)
      socket.emit('error:member', { message: err.message || 'Failed to leave channel.' })
    }
  }

  /**
   * Handle inviting a user to a channel
   */
  private async handleInviteUser(
    socket: Socket,
    userId: number,
    data: { userId: number; channelId: string }
  ): Promise<void> {
    try {
      await this.memberService.inviteUser(userId, data.userId, data.channelId)
      this.io.emit('member:invited', {
        userId: data.userId,
        channelId: data.channelId,
        invitedBy: userId,
      })
      console.log(`🟢 Pending invite for user ${data.userId} to channel ${data.channelId}`)
    } catch (err: any) {
      console.error('❌ Invite error:', err)
      socket.emit('error:member', { message: err.message || 'Failed to invite user.' })
    }
  }

  /**
   * Handle declining an invitation
   */
  private handleDeclineInvite(socket: Socket, userId: number, channelId: string): void {
    this.memberService.clearPendingInvite(userId, channelId)
    socket.emit('member:invitationCleared', { channelId })
  }

  /**
   * Handle kicking a user from a channel
   */
  private async handleKickUser(
    socket: Socket,
    userId: number,
    data: { targetId: number; channelId: string }
  ): Promise<void> {
    try {
      await this.memberService.kickUser(userId, data.targetId, data.channelId)
      this.io.emit('member:kicked', { userId: data.targetId, channelId: data.channelId })
      console.log(`🔴 Kicked user ${data.targetId} from channel ${data.channelId}`)
    } catch (err: any) {
      console.error('❌ Kick error:', err)
      socket.emit('error:member', { message: err.message || 'Failed to kick user.' })
    }
  }

  /**
   * Handle banning a user (admin action)
   */
  private async handleBanUser(
    socket: Socket,
    userId: number,
    data: { targetId: number; channelId: string }
  ): Promise<void> {
    try {
      await this.memberService.banUser(userId, data.targetId, data.channelId)
      this.io.emit('member:banned', {
        userId: data.targetId,
        channelId: data.channelId,
        isPermanent: true,
        reason: 'admin',
      })
      console.log(`🚫 User ${data.targetId} banned from channel ${data.channelId} by admin`)
    } catch (err: any) {
      console.error('❌ Ban error:', err)
      socket.emit('error:member', { message: err.message || 'Failed to ban user.' })
    }
  }

  /**
   * Handle unbanning a user
   */
  private async handleUnbanUser(
    socket: Socket,
    userId: number,
    data: { targetId: number; channelId: string }
  ): Promise<void> {
    try {
      await this.memberService.unbanUser(userId, data.targetId, data.channelId)
      this.io.emit('member:unbanned', { userId: data.targetId, channelId: data.channelId })
      console.log(`✅ User ${data.targetId} unbanned from channel ${data.channelId}`)
    } catch (err: any) {
      console.error('❌ Unban error:', err)
      socket.emit('error:member', { message: err.message || 'Failed to unban user.' })
    }
  }

  /**
   * Handle vote ban
   */
  private async handleVoteBan(
    socket: Socket,
    userId: number,
    data: { targetId: number; channelId: string }
  ): Promise<void> {
    try {
      const result = await this.memberService.voteBan(userId, data.targetId, data.channelId)
      this.io.emit('member:banVote', {
        userId: data.targetId,
        channelId: data.channelId,
        votes: result.votes,
        threshold: result.threshold,
      })

      if (result.shouldBan) {
        this.io.emit('member:banned', {
          userId: data.targetId,
          channelId: data.channelId,
          isPermanent: true,
          reason: 'vote',
        })
        console.log(`🚫 User ${data.targetId} banned from channel ${data.channelId} via vote`)
      }
    } catch (err: any) {
      console.error('❌ Vote ban error:', err)
      socket.emit('error:member', { message: err.message || 'Failed to vote ban.' })
    }
  }

  /**
   * Send pending invitations to a user
   */
  sendPendingInvitations(socket: Socket, userId: number): void {
    const pendingInvites = this.memberService.getPendingInvites(userId)
    pendingInvites.forEach((channelId) => {
      socket.emit('member:invited', { userId, channelId })
    })
  }
}
