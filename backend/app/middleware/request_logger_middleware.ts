import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'

/**
 * Middleware to log HTTP requests
 */
export default class RequestLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startTime = Date.now()
    const { method, url, headers } = ctx.request

    // Log incoming request
    logger.info({
      msg: 'Incoming request',
      method,
      url,
      ip: ctx.request.ip(),
      userAgent: headers['user-agent'],
      requestId: ctx.request.id(),
    })

    // Continue to next middleware/handler
    await next()

    // Log response
    const duration = Date.now() - startTime
    const { statusCode } = ctx.response

    logger.info({
      msg: 'Request completed',
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      requestId: ctx.request.id(),
    })
  }
}
