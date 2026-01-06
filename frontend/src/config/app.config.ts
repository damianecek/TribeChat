/**
 * Application configuration
 * Centralized configuration for API URLs and other app settings
 */

export const appConfig = {
  // API base URL - falls back to localhost if not set
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  
  // WebSocket URL - falls back to API URL if not set
  wsUrl: import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3333',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const

// Log configuration in development
if (appConfig.isDevelopment) {
  console.log('🔧 App Configuration:', appConfig)
}
