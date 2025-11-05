import type { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'
import UserChannel from '#models/user_channel'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class ChannelsController {
  /**
   * GET /channels
   * Vráti zoznam kanálov, kde je aktuálny user členom
   */
  async index({ auth }: HttpContext) {
    const user = auth.user!
    const memberships = await UserChannel.query().where('user_id', user.id).preload('channel')
    const channels = memberships.map((uc) => uc.channel)
    return channels
  }

  /**
   * POST /channels
   * Vytvorí nový kanál (verejný alebo súkromný)
   * body: { channelName: string, isPublic: boolean }
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { channelName, isPublic } = request.only(['channelName', 'isPublic'])

    // skontroluj unikátnosť mena kanála
    const exists = await Channel.findBy('channel_name', channelName)
    if (exists) {
      return response.badRequest({ error: 'Channel name already exists.' })
    }

    const channel = await Channel.create({
      channelName,
      isPublic,
      adminId: user.id,
      lastMessage: DateTime.local(),
    })

    // automaticky pridať admina ako člena
    await UserChannel.create({
      userId: user.id,
      channelId: channel.id,
    })

    return channel
  }

  /**
   * GET /channels/:id
   * Detail kanála (vrátane správ)
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const { id } = params

    // skontroluj, či user je členom kanála
    const membership = await UserChannel.query()
      .where('user_id', user.id)
      .andWhere('channel_id', id)
      .first()

    if (!membership) {
      return response.unauthorized({ error: 'You are not a member of this channel.' })
    }

    const channel = await Channel.query()
      .where('id', id)
      .preload('messages', (msgQuery) => msgQuery.preload('author'))
      .firstOrFail()

    return channel
  }

  /**
   * GET /channels/:id/members
   * Zoznam členov kanála
   */
  async members({ params, response }: HttpContext) {
    const { id } = params

    const members = await User.query()
      .join('user_channels', 'users.id', '=', 'user_channels.user_id')
      .where('user_channels.channel_id', id)
      .select('users.id', 'users.nickname', 'users.email', 'users.state')

    if (!members.length) {
      return response.notFound({ error: 'No members found for this channel.' })
    }

    return members
  }

  /**
   * DELETE /channels/:id
   * Zruší kanál (len admin)
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const { id } = params

    const channel = await Channel.findOrFail(id)

    if (channel.adminId !== user.id) {
      return response.unauthorized({ error: 'Only channel admin can delete this channel.' })
    }

    await channel.delete()
    return { message: `Channel ${channel.channelName} deleted successfully.` }
  }
}
