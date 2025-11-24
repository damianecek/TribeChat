import type { HttpContext } from '@adonisjs/core/http'
import UserChannel from '#models/user_channel'
import Blacklist from '#models/blacklist'
import { getIo } from '#start/ws'

export default class UserChannelsController {
  /**
   * GET /user-channels
   */
  async index({ response }: HttpContext) {
    const userChannels = await UserChannel.all()
    return response.ok(userChannels)
  }

  /**
   * POST /user-channels
   * body: { userId: number, channelId: string }
   */
  async store({ request, response }: HttpContext) {
    const { userId, channelId } = request.only(['userId', 'channelId'])

    const banned = await Blacklist.query()
      .where('user_id', userId)
      .andWhere('channel_id', channelId)
      .andWhere('is_permanent', true)
      .first()
    if (banned) {
      return response.forbidden({ error: 'User is banned from this channel' })
    }

    const exists = await UserChannel.query().where({ userId, channelId }).first()
    if (exists) {
      return response.badRequest({ error: 'User already in this channel' })
    }

    const userChannel = await UserChannel.create({ userId, channelId })

    getIo().emit('userChannel:created', { userId, channelId })

    return response.created(userChannel)
  }

  /**
   * DELETE /user-channels/:id
   */
  async destroy({ params, response }: HttpContext) {
    const userChannel = await UserChannel.findOrFail(params.id)
    const { userId, channelId } = userChannel

    await userChannel.delete()

    getIo().emit('userChannel:removed', { userId, channelId })

    return response.ok({ message: 'User removed from channel' })
  }
}
