import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import { ChannelService } from '#services/channel.service'
import { MemberService } from '#services/member.service'
import { MessageService } from '#services/message.service'
import { CleanupService } from '#services/cleanup.service'
import { SocketAuthMiddleware } from '#websocket/middleware/auth.middleware'
import { ChannelHandler } from '#websocket/handlers/channel.handler'
import { MemberHandler } from '#websocket/handlers/member.handler'
import { MessageHandler } from '#websocket/handlers/message.handler'
import { TypingHandler } from '#websocket/handlers/typing.handler'
import { UserHandler } from '#websocket/handlers/user.handler'

let io: Server | null = null

app.ready(() => {
  io = new Server(server.getNodeServer(), {
    cors: { origin: 'http://localhost:9000' },
  })

  // Initialize services
  const channelService = new ChannelService()
  const memberService = new MemberService()
  const messageService = new MessageService()
  const cleanupService = new CleanupService(channelService, memberService, io)

  // Initialize handlers
  const channelHandler = new ChannelHandler(channelService, memberService, io)
  const memberHandler = new MemberHandler(memberService, io)
  const messageHandler = new MessageHandler(messageService, channelService, io)
  const typingHandler = new TypingHandler()
  const userHandler = new UserHandler(io)

  // Start periodic cleanup
  cleanupService.startPeriodicCleanup()

  io.on('connection', async (socket) => {
    // Authenticate socket connection
    const userId = await SocketAuthMiddleware.authenticate(socket)
    if (!userId) return

    console.log(`🟢 Connected: ${socket.id}, userId: ${userId}`)

    // Auto-join user's channels
    const userChannels = await memberService.getUserChannels(userId)
    for (const membership of userChannels) {
      socket.join(`channel:${membership.channelId}`)
    }
    console.log(`🔗 User ${userId} auto-joined ${userChannels.length} channels`)

    // Send current ban list
    const allBans = await memberService.getAllBans()
    socket.emit('member:banned:init', allBans)

    // Set user online
    await userHandler.setOnline(userId)

    // Re-send pending invitations
    memberHandler.sendPendingInvitations(socket, userId)

    // Register all event handlers
    channelHandler.register(socket, userId)
    memberHandler.register(socket, userId)
    messageHandler.register(socket, userId)
    typingHandler.register(socket, userId)
    userHandler.register(socket, userId)

    // Handle disconnect
    socket.on('disconnect', async () => {
      await userHandler.setOffline(userId)
      console.log(`🔴 Disconnected: ${socket.id}, userId: ${userId}`)
    })
  })

  console.log('✅ Socket.IO server initialized')
})

export function getIo(): Server {
  if (!io) throw new Error('Socket.IO server not initialized yet')
  return io
}
