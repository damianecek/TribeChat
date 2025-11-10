// start/ws.ts
import Channel from '#models/channel'
import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'

let io: Server | null = null

app.ready(() => {
  // napoj socket.io na HTTP server Adonisu
  io = new Server(server.getNodeServer(), {
    cors: {
      origin: 'http://localhost:9000',
    },
  })

  io.on('connection', (socket) => {
    console.log('WS client connected:', socket.id)

    socket.on('request:channels', async () => {
      const channels = await Channel.all()
      socket.emit('response:channels', channels)
    })

    socket.on('join:channel', (channelId: string) => {
      socket.join(`channel:${channelId}`)
      console.log(`Socket ${socket.id} joined channel:${channelId}`)
    })

    socket.on('leave:channel', (channelId: string) => {
      socket.leave(`channel:${channelId}`)
      console.log(`Socket ${socket.id} left channel:${channelId}`)
    })

    socket.on('disconnect', () => {
      console.log('WS client disconnected:', socket.id)
    })

    socket.on('user:status:update', ({ userId, status }) => {
      io?.emit('user:status:changed', { userId, status })
    })

    socket.on('user:joined:channel', ({ userId, channelId }) => {
      io?.emit('userChannel:created', { userId, channelId })
    })

    socket.on('user:left:channel', ({ userId, channelId }) => {
      io?.emit('userChannel:removed', { userId, channelId })
    })
  })

  console.log('Socket.IO server initialized')
})

export function getIo(): Server {
  if (!io) {
    throw new Error('Socket.IO server not initialized yet')
  }
  return io
}
