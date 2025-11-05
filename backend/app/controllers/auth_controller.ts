import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  /**
   * REGISTER
   * POST /auth/register
   */
  async register({ request, response }: HttpContext) {
    const data = request.only(['firstName', 'lastName', 'nickname', 'email', 'password'])

    try {
      const user = await User.create(data)

      const token = await User.accessTokens.create(user)

      return response.created({
        message: 'User registered successfully',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          nickname: user.nickname,
          email: user.email,
        },
        token,
      })
    } catch (error) {
      console.error('REGISTER ERROR:', error)
      return response.badRequest({ message: 'Registration failed', details: error.message })
    }
  }

  /**
   * LOGIN
   * POST /auth/login
   */
  async login({ request, response }: HttpContext) {
    const { uid, password } = request.only(['uid', 'password'])

    try {
      const user = await User.verifyCredentials(uid, password)

      const token = await User.accessTokens.create(user)

      return response.ok({
        message: 'Login successful',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          nickname: user.nickname,
          email: user.email,
        },
        token,
      })
    } catch (error) {
      console.error('LOGIN ERROR:', error)
      return response.unauthorized({ message: 'Invalid credentials', details: error.message })
    }
  }

  /**
   * LOGOUT
   * POST /auth/logout
   */
  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      const token = auth.user?.currentAccessToken

      if (user && token) {
        await User.accessTokens.delete(user, token.identifier)
      }

      return response.ok({ message: 'Logged out successfully' })
    } catch (error) {
      console.error('LOGOUT ERROR:', error)
      return response.internalServerError({ message: 'Logout failed', details: error.message })
    }
  }

  /**
   * ME
   * GET /auth/me
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    return response.ok({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        email: user.email,
      },
    })
  }
}
