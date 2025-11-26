import Channel from '#models/channel'
import UserChannel from '#models/user_channel'
import User from '#models/user'
import Blacklist from '#models/blacklist'
import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import { Secret } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import Message from '#models/message'

// Pending invitations per userId
const pendingInvites: Map<number, Set<string>> = new Map()

// Vote tracking per channel/user pair -> Set of voter userIds
const banVotes: Map<string, Set<number>> = new Map()

const BAN_VOTE_MIN_THRESHOLD = 3
const INACTIVITY_DAYS = 30

let io: Server | null = null

const banVoteKey = (channelId: string, targetId: number) => `${channelId}:${targetId}`

function addPendingInvite(userId: number, channelId: string) {
  const existing = pendingInvites.get(userId) || new Set<string>()
  existing.add(channelId)
  pendingInvites.set(userId, existing)
}

function clearPendingInvite(userId: number, channelId: string) {
  const existing = pendingInvites.get(userId)
  if (!existing) return
  existing.delete(channelId)
  if (existing.size === 0) pendingInvites.delete(userId)
}

function isInvited(userId: number, channelId: string) {
  return pendingInvites.get(userId)?.has(channelId) ?? false
}

async function finalizeBan(targetId: number, channelId: string, reason: string) {
  await Blacklist.updateOrCreate({ userId: targetId, channelId }, { isPermanent: true })

  await UserChannel.query().where('user_id', targetId).andWhere('channel_id', channelId).delete()

  banVotes.delete(banVoteKey(channelId, targetId))
  clearPendingInvite(targetId, channelId)

  io?.emit('member:banned', { userId: targetId, channelId, isPermanent: true, reason })
  console.log(`🚫 User ${targetId} banned from channel ${channelId} via ${reason}`)
}

async function cleanupInactiveChannels() {
  const cutoff = DateTime.now().minus({ days: INACTIVITY_DAYS })
  try {
    const staleChannels = await Channel.query()
      .where('last_message', '<', cutoff.toJSDate())
      .orWhereNull('last_message')

    for (const channel of staleChannels) {
      const channelId = channel.id
      await Blacklist.query().where('channel_id', channelId).delete()
      await channel.delete()
      io?.emit('channel:deleted', channelId)
      banVotes.forEach((_, key) => {
        if (key.startsWith(`${channelId}:`)) banVotes.delete(key)
      })
      pendingInvites.forEach((set, uid) => {
        set.delete(channelId)
        if (set.size === 0) pendingInvites.delete(uid)
      })
      console.log(`⏰ Channel ${channelId} deleted due to inactivity`)
    }
  } catch (err: any) {
    // During migrations the table may not exist yet; fail silently until DB is ready
    if (err?.code !== '42P01') {
      console.error('❌ Inactive channel cleanup failed:', err)
    }
  }
}

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

    // Send current ban list so UI can render badges after refresh
    const allBans = await Blacklist.query().where('is_permanent', true)
    socket.emit(
      'member:banned:init',
      allBans.map((ban) => ({
        userId: ban.userId,
        channelId: ban.channelId,
        isPermanent: ban.isPermanent,
      }))
    )

    await User.query().where('id', userId).update({ status: 'Online' })
    io?.emit('user:status', { userId, status: 'Online' })

    // Re-send any pending invitations for this user after reconnect
    pendingInvites
      .get(userId)
      ?.forEach((channelId) => socket.emit('member:invited', { userId, channelId }))

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

        await Blacklist.query().where('channel_id', channelId).delete()
        await channel.delete()
        await UserChannel.query().where('channel_id', channelId).delete()
        banVotes.forEach((_, key) => {
          if (key.startsWith(`${channelId}:`)) banVotes.delete(key)
        })
        pendingInvites.forEach((set, uid) => {
          set.delete(channelId)
          if (set.size === 0) pendingInvites.delete(uid)
        })
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

        socket.leave(`channel:${channelId}`)
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

          const isBanned = await Blacklist.query()
            .where('user_id', invitedId)
            .andWhere('channel_id', channelId)
            .andWhere('is_permanent', true)
            .first()

          if (isBanned)
            return socket.emit('error:member', { message: 'User is banned from this channel.' })

          const exists = await UserChannel.query()
            .where('user_id', invitedId)
            .andWhere('channel_id', channelId)
            .first()

          if (exists) return socket.emit('error:member', { message: 'User already in channel.' })

          addPendingInvite(invitedId, channelId)
          io?.emit('member:invited', { userId: invitedId, channelId, invitedBy: userId })
          console.log(`🟢 Pending invite for user ${invitedId} to channel ${channelId}`)
        } catch (err) {
          console.error('❌ Invite error:', err)
        }
      }
    )

    // === DECLINE INVITE ===
    socket.on('member:declineInvite', (channelId: string) => {
      clearPendingInvite(userId!, channelId)
      socket.emit('member:invitationCleared', { channelId })
    })

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
          clearPendingInvite(targetId, channelId)

          io?.emit('member:kicked', { userId: targetId, channelId })
          console.log(`🔴 Kicked user ${targetId} from channel ${channelId}`)
        } catch (err) {
          console.error('❌ Kick error:', err)
        }
      }
    )

    // === ADMIN BAN (PERMANENT) ===
    socket.on(
      'member:ban',
      async ({ targetId, channelId }: { targetId: number; channelId: string }) => {
        try {
          const channel = await Channel.find(channelId)
          if (!channel) return socket.emit('error:member', { message: 'Channel not found.' })

          if (channel.adminId !== userId)
            return socket.emit('error:member', { message: 'Not authorized to ban.' })

          if (channel.adminId === targetId)
            return socket.emit('error:member', { message: 'Cannot ban the channel owner.' })

          await finalizeBan(targetId, channelId, 'admin')
        } catch (err) {
          console.error('❌ Ban error:', err)
        }
      }
    )

    // === ADMIN UNBAN ===
    socket.on(
      'member:unban',
      async ({ targetId, channelId }: { targetId: number; channelId: string }) => {
        try {
          const channel = await Channel.find(channelId)
          if (!channel) return socket.emit('error:member', { message: 'Channel not found.' })

          if (channel.adminId !== userId)
            return socket.emit('error:member', { message: 'Not authorized to unban.' })

          await Blacklist.query()
            .where('user_id', targetId)
            .andWhere('channel_id', channelId)
            .delete()

          banVotes.delete(banVoteKey(channelId, targetId))
          io?.emit('member:unbanned', { userId: targetId, channelId })
          console.log(`✅ User ${targetId} unbanned from channel ${channelId}`)
        } catch (err) {
          console.error('❌ Unban error:', err)
        }
      }
    )

    // === VOTE BAN ===
    socket.on(
      'member:voteBan',
      async ({ targetId, channelId }: { targetId: number; channelId: string }) => {
        try {
          if (targetId === userId) return

          const channel = await Channel.find(channelId)
          if (!channel) return socket.emit('error:member', { message: 'Channel not found.' })

          if (channel.adminId === targetId)
            return socket.emit('error:member', { message: 'Cannot ban the channel owner.' })

          const targetMembership = await UserChannel.query()
            .where('user_id', targetId)
            .andWhere('channel_id', channelId)
            .first()
          if (!targetMembership) {
            socket.emit('error:member', { message: 'Target is not a channel member.' })
            return
          }

          const key = banVoteKey(channelId, targetId)
          const voters = banVotes.get(key) || new Set<number>()
          voters.add(userId!)
          banVotes.set(key, voters)

          const memberCountResult = await UserChannel.query()
            .where('channel_id', channelId)
            .count('* as total')
          const memberCountRow = memberCountResult[0]
          const memberCount = Number(memberCountRow.$extras?.total ?? memberCountRow.total ?? 0)
          const threshold = Math.max(BAN_VOTE_MIN_THRESHOLD, Math.ceil(memberCount / 2))

          const votes = voters.size
          io?.emit('member:banVote', { userId: targetId, channelId, votes, threshold })

          if (votes >= threshold) {
            await finalizeBan(targetId, channelId, 'vote')
          }
        } catch (err) {
          console.error('❌ Vote ban error:', err)
        }
      }
    )

    // === MESSAGES ===
    socket.on(
      'message:send',
      async ({ channelId, content }: { channelId: string; content: string }) => {
        if (!content.trim()) return

        try {
          const membership = await UserChannel.query()
            .where('user_id', userId!)
            .andWhere('channel_id', channelId)
            .first()
          if (!membership) {
            socket.emit('error:message', { message: 'Join the channel before sending messages.' })
            return
          }

          const isBanned = await Blacklist.query()
            .where('user_id', userId!)
            .andWhere('channel_id', channelId)
            .andWhere('is_permanent', true)
            .first()
          if (isBanned) {
            socket.emit('error:message', { message: 'You are banned from this channel.' })
            return
          }

          const message = await Message.create({
            channelId,
            authorId: userId!,
            content,
          })

          await message.load('author')
          await Channel.query().where('id', channelId).update({ lastMessage: DateTime.local() })

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
        const membership = await UserChannel.query()
          .where('user_id', userId!)
          .andWhere('channel_id', channelId)
          .first()
        if (!membership) {
          socket.emit('error:message', { message: 'Join the channel to view messages.' })
          return
        }

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
        const channel = await Channel.find(channelId)
        if (!channel) {
          socket.emit('error:member', { message: 'Channel not found.' })
          return
        }

        const isBanned = await Blacklist.query()
          .where('user_id', userId!)
          .andWhere('channel_id', channelId)
          .andWhere('is_permanent', true)
          .first()
        if (isBanned) {
          socket.emit('error:member', { message: 'You are banned from this channel.' })
          return
        }

        if (!channel.isPublic && channel.adminId !== userId && !isInvited(userId!, channelId)) {
          socket.emit('error:member', { message: 'Invite required to join this private channel.' })
          return
        }

        const existing = await UserChannel.query()
          .where('user_id', userId!)
          .andWhere('channel_id', channelId)
          .first()

        if (existing) {
          socket.join(`channel:${channelId}`)
          clearPendingInvite(userId!, channelId)
          return
        }

        const newLink = await UserChannel.create({
          userId: userId!,
          channelId,
        })

        clearPendingInvite(userId!, channelId)
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

    // === USER STARTED TYPING ===
    socket.on('typing:start', async ({ channelId, draft }) => {
      try {
        const membership = await UserChannel.query()
          .where('user_id', userId!)
          .andWhere('channel_id', channelId)
          .first()

        if (!membership) {
          return socket.emit('error:typing', { message: 'Join the channel to type.' })
        }

        const user = await User.find(userId!)
        const nickname = user?.nickname

        socket.broadcast.emit(`typing:start:${channelId}`, {
          userId,
          username: nickname,
          channelId,
          draft, // <<< send initial draft
        })

        console.log(`⌨️ ${nickname} is typing in channel ${channelId}`)
      } catch (err) {
        console.error('❌ typing:start error', err)
      }
    })

    // === USER UPDATES DRAFT MESSAGE ===
    socket.on('typing:draft', async ({ channelId, draft }) => {
      try {
        const membership = await UserChannel.query()
          .where('user_id', userId!)
          .andWhere('channel_id', channelId)
          .first()

        if (!membership) return

        const user = await User.find(userId!)
        const nickname = user?.nickname

        socket.broadcast.emit(`typing:draft:${channelId}`, {
          userId,
          username: nickname,
          channelId,
          draft,
        })
      } catch (err) {
        console.error('❌ typing:draft error', err)
      }
    })

    // === USER STOPPED TYPING ===
    socket.on('typing:stop', async ({ channelId }) => {
      try {
        const membership = await UserChannel.query()
          .where('user_id', userId!)
          .andWhere('channel_id', channelId)
          .first()

        if (!membership) {
          return socket.emit('error:typing', { message: 'Join the channel first.' })
        }

        const user = await User.find(userId!)
        const nickname = user?.nickname

        socket.broadcast.emit(`typing:stop:${channelId}`, {
          userId,
          username: nickname,
          channelId,
        })

        console.log(`🛑 ${nickname} stopped typing in channel ${channelId}`)
      } catch (err) {
        console.error('❌ typing:stop error', err)
      }
    })
  })

  // Periodically remove inactive channels

  setInterval(() => void cleanupInactiveChannels(), 1000 * 60 * 60)

  console.log('✅ Socket.IO server initialized')
})

export function getIo(): Server {
  if (!io) throw new Error('Socket.IO server not initialized yet')
  return io
}
