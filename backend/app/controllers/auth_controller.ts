import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  /**
   * Register
   */
  async register({ request, auth, response }: HttpContext) {
    const data = request.only(['firstName', 'lastName', 'nickname', 'email', 'password'])

    try {
      const user = await User.create(data)
      const token = await User.accessTokens.create(user)

      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          nickname: user.nickname,
          email: user.email,
        },
        token,
      }
    } catch (error) {
      console.error(error)
      return response.badRequest({ message: 'Registration failed' })
    }
  }

  /**
   * Login
   */
  async login({ request, response }: HttpContext) {
    const { uid, password } = request.only(['uid', 'password'])
    // uid = email alebo nickname (máme to v uids confige)

    try {
      const user = await User.verifyCredentials(uid, password)
      const token = await User.accessTokens.create(user)

      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          nickname: user.nickname,
          email: user.email,
        },
        token,
      }
    } catch {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

  /**
   * Logout
   */
  async logout({ auth, response }: HttpContext) {
    if (auth.user) {
      await User.accessTokens.delete(auth.user, auth.user.currentAccessToken.identifier)
    }
    return response.ok({ message: 'Logged out successfully' })
  }
  /**
   * Me
   */
  async me({ auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    const user = auth.user

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        email: user.email,
      },
    }
  }
}
