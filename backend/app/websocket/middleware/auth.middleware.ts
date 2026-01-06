import type { Socket } from 'socket.io'
import User from '#models/user'
import { Secret } from '@adonisjs/core/helpers'

export class SocketAuthMiddleware {
  /**
   * Authenticate a socket connection and return userId
   * Returns null if authentication fails
   */
  static async authenticate(socket: Socket): Promise<number | null> {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) {
      console.log('❌ Socket connection rejected: No token provided')
      socket.disconnect()
      return null
    }

    let userId: number | null = null
    try {
      const tokenRecord = await User.accessTokens.verify(new Secret(token))
      userId = tokenRecord ? Number(tokenRecord.tokenableId) : null
    } catch (err) {
      console.log('❌ Socket connection rejected: Invalid token')
      socket.disconnect()
      return null
    }

    if (!userId) {
      console.log('❌ Socket connection rejected: User not found')
      socket.disconnect()
      return null
    }

    return userId
  }
}
