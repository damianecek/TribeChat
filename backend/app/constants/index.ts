/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * User Status Constants
 */
export const USER_STATUS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  AWAY: 'Away',
  BUSY: 'Busy',
} as const

/**
 * Channel Types
 */
export const CHANNEL_TYPE = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  DIRECT: 'direct',
} as const

/**
 * WebSocket Event Names
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
 * Error Messages
 */
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  CHANNEL_NOT_FOUND: 'Channel not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
} as const

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_LOGGED_OUT: 'User logged out successfully',
  USER_UPDATED: 'User updated successfully',
  CHANNEL_CREATED: 'Channel created successfully',
  CHANNEL_UPDATED: 'Channel updated successfully',
  CHANNEL_DELETED: 'Channel deleted successfully',
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGE_DELETED: 'Message deleted successfully',
} as const
