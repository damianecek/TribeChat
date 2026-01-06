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
  
  // Safe access to window for browser environments
  const getDefaultWsUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return 'http://localhost:3333'
  }

  return {
    apiBaseUrl: process.env.API_BASE_URL || (isDevelopment ? 'http://localhost:3333' : '/api'),
    wsUrl: process.env.WS_URL || (isDevelopment ? 'http://localhost:3333' : getDefaultWsUrl()),
    environment: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'staging',
    enableDebugMode: isDevelopment,
  }
}

export const config = getEnvironmentConfig()
