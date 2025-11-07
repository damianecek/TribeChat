import UserChannel from '#models/user_channel'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserChannelsController {
  async index({ response }: HttpContext) {
    const userChannels = await UserChannel.all()
    return response.ok(userChannels)
  }
}
