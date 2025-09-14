'use client'

import io from 'socket.io-client'

interface ChatMessage {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  userId: string
  userName: string
  userRole: string
  roomId: string
  createdAt: string
  status: 'SENT' | 'DELIVERED' | 'READ'
}

interface TypingUser {
  userId: string
  userName: string
  roomId: string
}

interface ChatEvents {
  // Client to Server
  'join-room': (roomId: string) => void
  'leave-room': (roomId: string) => void
  'send-message': (message: Omit<ChatMessage, 'id' | 'createdAt' | 'status'>) => void
  'typing-start': (roomId: string) => void
  'typing-stop': (roomId: string) => void
  'mark-read': (messageId: string, roomId: string) => void
  
  // Server to Client
  'message-received': (message: ChatMessage) => void
  'message-status-updated': (messageId: string, status: string, userId: string) => void
  'user-typing': (typingUser: TypingUser) => void
  'user-stopped-typing': (typingUser: TypingUser) => void
  'room-updated': (roomId: string, data: any) => void
  'error': (error: string) => void
  'connected': () => void
  'disconnected': () => void
}

class ChatWebSocket {
  private socket: ReturnType<typeof io> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      if (this.isConnecting) {
        return
      }

      this.isConnecting = true

      try {
        this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
          auth: {
            token
          },
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        })

        this.socket.on('connect', () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.isConnecting = false
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason)
          this.isConnecting = false
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.handleReconnect()
          }
        })

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error)
          this.isConnecting = false
          this.handleReconnect()
          reject(error)
        })

        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error)
        })

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Event listeners
  on<K extends keyof ChatEvents>(event: K, callback: ChatEvents[K]) {
    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  off<K extends keyof ChatEvents>(event: K, callback?: ChatEvents[K]) {
    if (this.socket) {
      this.socket.off(event, callback as any)
    }
  }

  // Event emitters
  emit<K extends keyof ChatEvents>(event: K, ...args: Parameters<ChatEvents[K]>) {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args)
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event)
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocket(): ReturnType<typeof io> | null {
    return this.socket
  }
}

// Singleton instance
export const chatSocket = new ChatWebSocket()

// Hook for React components
export function useChatSocket() {
  return chatSocket
}

// Utility functions
export const createMessage = (data: {
  content: string
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  userId: string
  userName: string
  userRole: string
  roomId: string
}): Omit<ChatMessage, 'id' | 'createdAt' | 'status'> => {
  return {
    content: data.content,
    type: data.type || 'TEXT',
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    fileSize: data.fileSize,
    userId: data.userId,
    userName: data.userName,
    userRole: data.userRole,
    roomId: data.roomId
  }
}

export type { ChatMessage, TypingUser, ChatEvents }
