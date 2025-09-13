export const CHAT_CONFIG = {
  // Socket.io configuration
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  
  // File upload configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  
  // Chat room types
  ROOM_TYPES: {
    SUPPORT: 'SUPPORT',
    GENERAL: 'GENERAL',
    ADMIN: 'ADMIN'
  } as const,
  
  // Message types
  MESSAGE_TYPES: {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    FILE: 'FILE',
    SYSTEM: 'SYSTEM'
  } as const,
  
  // Message statuses
  MESSAGE_STATUSES: {
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ'
  } as const,
  
  // Room statuses
  ROOM_STATUSES: {
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
    CLOSED: 'CLOSED'
  } as const,
  
  // Priorities
  PRIORITIES: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
  } as const,
  
  // Participant roles
  ROLES: {
    MEMBER: 'MEMBER',
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR'
  } as const,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Real-time settings
  TYPING_TIMEOUT: 1000, // 1 second
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000, // 1 second
}

export type RoomType = typeof CHAT_CONFIG.ROOM_TYPES[keyof typeof CHAT_CONFIG.ROOM_TYPES]
export type MessageType = typeof CHAT_CONFIG.MESSAGE_TYPES[keyof typeof CHAT_CONFIG.MESSAGE_TYPES]
export type MessageStatus = typeof CHAT_CONFIG.MESSAGE_STATUSES[keyof typeof CHAT_CONFIG.MESSAGE_STATUSES]
export type RoomStatus = typeof CHAT_CONFIG.ROOM_STATUSES[keyof typeof CHAT_CONFIG.ROOM_STATUSES]
export type Priority = typeof CHAT_CONFIG.PRIORITIES[keyof typeof CHAT_CONFIG.PRIORITIES]
export type Role = typeof CHAT_CONFIG.ROLES[keyof typeof CHAT_CONFIG.ROLES]
