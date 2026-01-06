import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  // Allow requests from any origin in development, specific origins in production
  origin: (origin) => {
    // In development, allow all origins
    if (env.get('NODE_ENV') === 'development') {
      return true
    }

    // In production, allow specific origins
    const allowedOrigins = env.get('ALLOWED_ORIGINS', '').split(',').filter(Boolean)
    
    // If no origin is specified (like direct API calls), allow it
    if (!origin) {
      return true
    }

    // Check if origin is in allowed list
    return allowedOrigins.some(allowed => {
      // Support wildcards for local network (e.g., http://192.168.*.*)
      // Only allow wildcards in IP addresses for local network access
      if (allowed.includes('*')) {
        // Validate that wildcards are only in valid positions (IP octets)
        // Pattern: http(s)://192.168.*.* or http(s)://10.0.*.*
        const isValidWildcard = /^https?:\/\/(\d{1,3}\.){0,3}(\*\.?)+:?\d*$/.test(allowed)
        
        if (!isValidWildcard) {
          console.warn(`⚠️  Invalid wildcard pattern: ${allowed}. Wildcards should only be used for IP addresses.`)
          return false
        }
        
        const regex = new RegExp('^' + allowed.replace(/\*/g, '[0-9]{1,3}').replace(/\./g, '\\.') + '$')
        return regex.test(origin)
      }
      return origin === allowed
    })
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
