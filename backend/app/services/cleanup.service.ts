import { ChannelService } from '#services/channel.service'
import { MemberService } from '#services/member.service'
import type { Server } from 'socket.io'

export class CleanupService {
  private readonly INACTIVITY_DAYS = 30

  constructor(
    private channelService: ChannelService,
    private memberService: MemberService,
    private io: Server
  ) {}

  /**
   * Clean up inactive channels
   */
  async cleanupInactiveChannels(): Promise<void> {
    try {
      const staleChannels = await this.channelService.getInactiveChannels(this.INACTIVITY_DAYS)

      for (const channel of staleChannels) {
        const channelId = channel.id
        await this.channelService.deleteChannel(channelId, channel.adminId)
        this.memberService.clearChannelBanVotes(channelId)
        this.memberService.clearChannelInvites(channelId)
        this.io.emit('channel:deleted', channelId)
        console.log(`⏰ Channel ${channelId} deleted due to inactivity`)
      }
    } catch (err: any) {
      // During migrations the table may not exist yet; fail silently until DB is ready
      if (err?.code !== '42P01') {
        console.error('❌ Inactive channel cleanup failed:', err)
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  startPeriodicCleanup(): void {
    // Run cleanup every hour
    setInterval(() => void this.cleanupInactiveChannels(), 1000 * 60 * 60)
    console.log('✅ Periodic channel cleanup initialized')
  }
}
