import Channel from '#models/channel'
import User from '#models/user'
import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import { Secret } from '@adonisjs/core/helpers' // stále importujeme tento modul

let io: Server | null = null

app.ready(() => {
  io = new Server(server.getNodeServer(), {
    cors: { origin: 'http://localhost:9000' },
  })

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token as string | undefined

    if (!token) {
      console.warn('⚠️ Missing token in socket handshake, disconnecting.')
      socket.disconnect()
      return
    }

    let userId: number | null = null

    try {
      const tokenRecord = await User.accessTokens.verify(new Secret(token))
      userId = tokenRecord ? Number(tokenRecord.tokenableId) : null
    } catch {
      console.warn('❌ Invalid token in socket handshake, disconnecting.')
      socket.disconnect()
      return
    }

    if (!userId) {
      console.warn('⚠️ No userId extracted from token, disconnecting.')
      socket.disconnect()
      return
    }

    console.log('🟢 Connected:', socket.id, 'userId:', userId)

    await User.query().where('id', userId).update({ status: 'Online' })
    io?.emit('user:status', { userId, status: 'Online' })

    // --- USER STATUS ---
    socket.on('user:setStatus', async ({ status }: { status: string }) => {
      await User.query().where('id', userId).update({ status })
      io?.emit('user:status', { userId, status })
    })

    // --- CHANNEL REQUESTS ---
    socket.on('request:channels', async () => {
      const channels = await Channel.all()
      socket.emit('response:channels', channels)
    })

    // --- JOIN / LEAVE CHANNEL ---
    socket.on('join:channel', (channelId: string) => {
      socket.join(`channel:${channelId}`)
      console.log(`🟢 ${socket.id} joined channel:${channelId}`)
    })

    socket.on('leave:channel', (channelId: string) => {
      socket.leave(`channel:${channelId}`)
      console.log(`🔵 ${socket.id} left channel:${channelId}`)
    })

    // --- MEMBERSHIP EVENTS ---
    socket.on('user:joined:channel', (payload: { userId: number; channelId: string }) => {
      io?.emit('userChannel:created', payload)
    })

    socket.on('user:left:channel', (payload: { userId: number; channelId: string }) => {
      io?.emit('userChannel:removed', payload)
    })

    // --- DISCONNECT ---
    socket.on('disconnect', async () => {
      await User.query().where('id', userId).update({ status: 'Offline' })
      io?.emit('user:status', { userId, status: 'Offline' })
      console.log(`🔴 Disconnected: ${socket.id}, userId: ${userId}`)
    })
  })

  console.log('✅ Socket.IO server initialized')
})

export function getIo(): Server {
  if (!io) throw new Error('Socket.IO server not initialized yet')
  return io
}
