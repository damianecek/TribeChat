import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: (origin) => {
    // Allow all origins in development
    if (!env.get('NODE_ENV') || env.get('NODE_ENV') === 'development') {
      return true
    }

    // In production, check against allowed origins
    const allowedOrigins = env.get('CORS_ORIGINS', 'http://localhost').split(',')
    return allowedOrigins.includes(origin) || origin === undefined
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
