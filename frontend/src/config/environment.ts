/**
 * Environment Configuration
 * Defines the environment-specific settings for the application
 */

interface EnvironmentConfig {
  apiBaseUrl: string
  wsUrl: string
  environment: 'development' | 'production' | 'staging'
  enableDebugMode: boolean
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return {
    apiBaseUrl: process.env.API_BASE_URL || (isDevelopment ? 'http://localhost:3333' : '/api'),
    wsUrl: process.env.WS_URL || (isDevelopment ? 'http://localhost:3333' : window.location.origin),
    environment: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'staging',
    enableDebugMode: isDevelopment,
  }
}

export const config = getEnvironmentConfig()
