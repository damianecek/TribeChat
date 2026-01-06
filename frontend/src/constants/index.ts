/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3333',
  TIMEOUT: 30000, // 30 seconds - sufficient for most API calls
  RETRY_ATTEMPTS: 3, // Retry failed requests up to 3 times
} as const

/**
 * WebSocket Configuration
 */
export const WS_CONFIG = {
  URL: process.env.WS_URL || 'http://localhost:3333',
  RECONNECTION_ATTEMPTS: 5, // Try to reconnect 5 times before giving up
  RECONNECTION_DELAY: 1000, // Wait 1 second between reconnection attempts
} as const

/**
 * Application Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  MAIN: '/main',
} as const

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

/**
 * User Status
 */
export const USER_STATUS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  AWAY: 'Away',
  BUSY: 'Busy',
} as const

/**
 * Message Types
 */
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
} as const

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'positive',
  ERROR: 'negative',
  WARNING: 'warning',
  INFO: 'info',
} as const

/**
 * WebSocket Events
 */
export const WS_EVENTS = {
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_STATUS_CHANGED: 'user:statusChanged',
  CHANNEL_CREATED: 'channel:created',
  CHANNEL_UPDATED: 'channel:updated',
  CHANNEL_DELETED: 'channel:deleted',
  CHANNEL_JOINED: 'channel:joined',
  CHANNEL_LEFT: 'channel:left',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_DELETED: 'message:deleted',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
} as const

/**
 * Validation Rules
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NICKNAME_MIN_LENGTH: 3,
  NICKNAME_MAX_LENGTH: 30,
  MESSAGE_MAX_LENGTH: 2000,
  CHANNEL_NAME_MAX_LENGTH: 50,
} as const
