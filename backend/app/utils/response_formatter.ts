import type { HttpContext } from '@adonisjs/core/http'
import { HTTP_STATUS } from '#constants/index'

/**
 * Standard API Response Format
 */
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: any[]
  meta?: {
    timestamp: string
    requestId?: string
  }
}

/**
 * Success Response Helper
 */
export class ResponseFormatter {
  /**
   * Format success response
   */
  static success<T>(
    ctx: HttpContext,
    data?: T,
    message?: string,
    statusCode: number = HTTP_STATUS.OK
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: ctx.request.id(),
      },
    }

    ctx.response.status(statusCode).json(response)
  }

  /**
   * Format created response
   */
  static created<T>(ctx: HttpContext, data?: T, message?: string): void {
    this.success(ctx, data, message, HTTP_STATUS.CREATED)
  }

  /**
   * Format no content response
   */
  static noContent(ctx: HttpContext): void {
    ctx.response.status(HTTP_STATUS.NO_CONTENT).send(null)
  }

  /**
   * Format error response
   */
  static error(
    ctx: HttpContext,
    message: string,
    errors?: any[],
    statusCode: number = HTTP_STATUS.BAD_REQUEST
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: ctx.request.id(),
      },
    }

    ctx.response.status(statusCode).json(response)
  }

  /**
   * Format validation error response
   */
  static validationError(ctx: HttpContext, errors: any[]): void {
    this.error(ctx, 'Validation failed', errors, HTTP_STATUS.UNPROCESSABLE_ENTITY)
  }

  /**
   * Format not found response
   */
  static notFound(ctx: HttpContext, message: string = 'Resource not found'): void {
    this.error(ctx, message, undefined, HTTP_STATUS.NOT_FOUND)
  }

  /**
   * Format unauthorized response
   */
  static unauthorized(ctx: HttpContext, message: string = 'Unauthorized'): void {
    this.error(ctx, message, undefined, HTTP_STATUS.UNAUTHORIZED)
  }

  /**
   * Format forbidden response
   */
  static forbidden(ctx: HttpContext, message: string = 'Forbidden'): void {
    this.error(ctx, message, undefined, HTTP_STATUS.FORBIDDEN)
  }

  /**
   * Format internal error response
   */
  static internalError(ctx: HttpContext, message: string = 'Internal server error'): void {
    this.error(ctx, message, undefined, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
