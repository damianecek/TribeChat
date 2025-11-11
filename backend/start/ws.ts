import Channel from '#models/channel'
import UserChannel from '#models/user_channel'
import User from '#models/user'
import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import { Secret } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import Message from '#models/message'

let io: Server | null = null

app.ready(() => {
  io = new Server(server.getNodeServer(), {
    cors: { origin: 'http://localhost:9000' },
  })

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) {
      socket.disconnect()
      return
    }

    let userId: number | null = null
    try {
      const tokenRecord = await User.accessTokens.verify(new Secret(token))
      userId = tokenRecord ? Number(tokenRecord.tokenableId) : null
    } catch {
      socket.disconnect()
      return
    }

    if (!userId) {
      socket.disconnect()
      return
    }

    console.log(`🟢 Connected: ${socket.id}, userId: ${userId}`)

    await User.query().where('id', userId).update({ status: 'Online' })
    io?.emit('user:status', { userId, status: 'Online' })

    // === USER STATUS ===
    socket.on('user:setStatus', async ({ status }: { status: string }) => {
      await User.query().where('id', userId).update({ status })
      io?.emit('user:status', { userId, status })
    })

    // === GET ALL CHANNELS ===
    socket.on('request:channels', async () => {
      const channels = await Channel.all()
      socket.emit('response:channels', channels)
    })

    // === CREATE CHANNEL ===
    socket.on('channel:create', async ({ name, isPublic }: { name: string; isPublic: boolean }) => {
      try {
        const exists = await Channel.findBy('channel_name', name)
        if (exists) {
          socket.emit('error:channel', { message: 'Channel name already exists.' })
          return
        }

        const channel = await Channel.create({
          channelName: name,
          isPublic,
          adminId: userId!,
          lastMessage: DateTime.local(),
        })

        await UserChannel.create({
          userId: userId!,
          channelId: channel.id,
        })

        io?.emit('channel:created', channel)
        console.log(`🟢 Channel created: ${name} by ${userId}`)
      } catch (err) {
        console.error('❌ Channel creation error:', err)
      }
    })

    // === UPDATE CHANNEL ===
    socket.on(
      'channel:update',
      async ({ id, name, isPublic }: { id: string; name: string; isPublic: boolean }) => {
        try {
          const channel = await Channel.find(id)
          if (!channel) return socket.emit('error:channel', { message: 'Channel not found.' })

          if (channel.adminId !== userId)
            return socket.emit('error:channel', {
              message: 'Not authorized to update this channel.',
            })

          channel.channelName = name
          channel.isPublic = isPublic
          channel.updatedAt = DateTime.local()
          await channel.save()

          io?.emit('channel:updated', channel)
          console.log(`🟡 Channel updated: ${channel.channelName}`)
        } catch (err) {
          console.error('❌ Channel update error:', err)
        }
      }
    )

    // === DELETE CHANNEL ===
    socket.on('channel:delete', async (channelId: string) => {
      try {
        const channel = await Channel.find(channelId)
        if (!channel) return

        if (channel.adminId !== userId)
          return socket.emit('error:channel', { message: 'Not authorized to delete this channel.' })

        await channel.delete()
        await UserChannel.query().where('channel_id', channelId).delete()
        io?.emit('channel:deleted', channelId)
        console.log(`🔴 Channel deleted: ${channelId}`)
      } catch (err) {
        console.error('❌ Channel delete error:', err)
      }
    })

    // === MEMBER LEAVE ===
    socket.on('member:leave', async (channelId: string) => {
      try {
        await UserChannel.query()
          .where('user_id', userId!)
          .andWhere('channel_id', channelId)
          .delete()

        io?.emit('member:left', { userId, channelId })
        console.log(`🔵 User ${userId} left channel ${channelId}`)
      } catch (err) {
        console.error('❌ Member leave error:', err)
      }
    })

    // === INVITE USER ===
    socket.on(
      'member:invite',
      async ({ userId: invitedId, channelId }: { userId: number; channelId: string }) => {
        try {
          const channel = await Channel.find(channelId)
          if (!channel) return socket.emit('error:member', { message: 'Channel not found.' })

          if (channel.adminId !== userId)
            return socket.emit('error:member', { message: 'Not authorized to invite.' })

          const exists = await UserChannel.query()
            .where('user_id', invitedId)
            .andWhere('channel_id', channelId)
            .first()

          if (exists) return socket.emit('error:member', { message: 'User already in channel.' })

          const uc = await UserChannel.create({ userId: invitedId, channelId })
          io?.emit('member:invited', { userId: invitedId, channelId, id: uc.id })
          console.log(`🟢 Invited user ${invitedId} to channel ${channelId}`)
        } catch (err) {
          console.error('❌ Invite error:', err)
        }
      }
    )

    // === KICK USER ===
    socket.on(
      'member:kick',
      async ({ targetId, channelId }: { targetId: number; channelId: string }) => {
        try {
          const channel = await Channel.find(channelId)
          if (!channel) return socket.emit('error:member', { message: 'Channel not found.' })

          if (channel.adminId !== userId)
            return socket.emit('error:member', { message: 'Not authorized to kick.' })

          await UserChannel.query()
            .where('user_id', targetId)
            .andWhere('channel_id', channelId)
            .delete()

          io?.emit('member:kicked', { userId: targetId, channelId })
          console.log(`🔴 Kicked user ${targetId} from channel ${channelId}`)
        } catch (err) {
          console.error('❌ Kick error:', err)
        }
      }
    )

    // === MESSAGES ===
    socket.on(
      'message:send',
      async ({ channelId, content }: { channelId: string; content: string }) => {
        if (!content.trim()) return

        try {
          const message = await Message.create({
            channelId,
            authorId: userId!,
            content,
          })

          await message.load('author')

          // ✅ iba broadcast do roomu (bez duplicity pre odosielateľa)
          io?.to(`channel:${channelId}`).emit('message:new', {
            id: message.id,
            channelId: message.channelId,
            authorId: message.authorId,
            author: message.author,
            content: message.content,
            createdAt: message.createdAt,
          })

          console.log(`💬 User ${userId} sent message in channel ${channelId}`)
        } catch (err) {
          console.error('❌ message:send error', err)
          socket.emit('error:message', { message: 'Failed to send message' })
        }
      }
    )

    // === FETCH ALL MESSAGES IN CHANNEL ===
    socket.on('message:fetch', async (channelId: string) => {
      try {
        const messages = await Message.query()
          .where('channel_id', channelId)
          .orderBy('created_at', 'asc')
          .preload('author')

        socket.emit('message:list', messages)
        console.log(`📜 Sent ${messages.length} messages for channel ${channelId}`)
      } catch (err) {
        console.error('❌ message:fetch error', err)
      }
    })

    // === DELETE MESSAGE ===
    socket.on('message:delete', async (id: string) => {
      try {
        const msg = await Message.find(id)
        if (!msg) return
        if (msg.authorId !== userId) {
          socket.emit('error:message', { message: 'Not authorized to delete this message' })
          return
        }

        await msg.delete()
        io?.to(`channel:${msg.channelId}`).emit('message:deleted', { id: msg.id })
        console.log(`🗑️ Message ${id} deleted by user ${userId}`)
      } catch (err) {
        console.error('❌ message:delete error', err)
      }
    })

    // === EDIT MESSAGE ===
    socket.on('message:update', async ({ id, content }: { id: string; content: string }) => {
      try {
        const msg = await Message.find(id)
        if (!msg) return
        if (msg.authorId !== userId) {
          socket.emit('error:message', { message: 'Not authorized to edit this message' })
          return
        }

        msg.content = content
        await msg.save()

        io?.to(`channel:${msg.channelId}`).emit('message:updated', msg)
        console.log(`✏️ Message ${id} updated`)
      } catch (err) {
        console.error('❌ message:update error', err)
      }
    })

    // === JOIN CHANNEL ROOM ===
    socket.on('member:join', async (channelId: string) => {
      try {
        const existing = await UserChannel.query()
          .where('user_id', userId!)
          .andWhere('channel_id', channelId)
          .first()

        if (existing) {
          socket.join(`channel:${channelId}`)
          return
        }

        const newLink = await UserChannel.create({
          userId: userId!,
          channelId,
        })

        socket.join(`channel:${channelId}`)
        io?.emit('member:joined', { userId, channelId, id: newLink.id })
        console.log(`🟢 User ${userId} joined channel ${channelId}`)
      } catch (err) {
        console.error('❌ Member join error:', err)
      }
    })

    // === DISCONNECT ===
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
