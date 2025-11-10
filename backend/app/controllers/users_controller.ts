import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { getIo } from '#start/ws'

export default class UsersController {
  /**
   * GET /users
   * Vráti všetkých userov
   */
  async index({ response }: HttpContext) {
    const users = await User.all()
    return response.ok(users)
  }

  /**
   * PATCH /users/status
   */
  async updateStatus({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { status } = request.only(['status'])

    if (!status) {
      return response.badRequest({ error: 'Missing status field.' })
    }

    user.status = status
    await user.save()

    // broadcast všetkým
    getIo().emit('user:status', { userId: user.id, status })

    return response.ok({ message: 'Status updated.', status })
  }
}
