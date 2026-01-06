import type { Socket, Server } from 'socket.io'
import User from '#models/user'

export class UserHandler {
  constructor(private io: Server) {}

  /**
   * Register all user-related event handlers
   */
  register(socket: Socket, userId: number): void {
    socket.on('user:setStatus', (data) => this.handleSetStatus(socket, userId, data))
  }

  /**
   * Handle user status update
   */
  private async handleSetStatus(
    _socket: Socket,
    userId: number,
    data: { status: string }
  ): Promise<void> {
    try {
      await User.query().where('id', userId).update({ status: data.status })
      this.io.emit('user:status', { userId, status: data.status })
    } catch (err) {
      console.error('❌ user:setStatus error', err)
    }
  }

  /**
   * Set user online status
   */
  async setOnline(userId: number): Promise<void> {
    await User.query().where('id', userId).update({ status: 'Online' })
    this.io.emit('user:status', { userId, status: 'Online' })
  }

  /**
   * Set user offline status
   */
  async setOffline(userId: number): Promise<void> {
    await User.query().where('id', userId).update({ status: 'Offline' })
    this.io.emit('user:status', { userId, status: 'Offline' })
  }
}
