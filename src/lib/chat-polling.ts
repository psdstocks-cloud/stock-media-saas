// src/lib/chat-polling.ts
// Polling-based chat system for Vercel compatibility

export class ChatPollingService {
  private static instance: ChatPollingService
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false
  private lastMessageId: string | null = null
  private callbacks: {
    onNewMessage?: (message: any) => void
    onError?: (error: any) => void
  } = {}

  private constructor() {}

  public static getInstance(): ChatPollingService {
    if (!ChatPollingService.instance) {
      ChatPollingService.instance = new ChatPollingService()
    }
    return ChatPollingService.instance
  }

  public startPolling(roomId: string, userId: string) {
    if (this.isPolling) {
      this.stopPolling()
    }

    console.log('Starting chat polling for room:', roomId)
    this.isPolling = true

    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/messages?roomId=${roomId}&lastMessageId=${this.lastMessageId || ''}`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.messages && data.messages.length > 0) {
            // Update last message ID
            this.lastMessageId = data.messages[data.messages.length - 1].id
            
            // Call callback for each new message
            data.messages.forEach((message: any) => {
              if (this.callbacks.onNewMessage) {
                this.callbacks.onNewMessage(message)
              }
            })
          }
        } else {
          console.error('Failed to fetch messages:', response.status)
          if (this.callbacks.onError) {
            this.callbacks.onError(new Error(`HTTP ${response.status}`))
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
        if (this.callbacks.onError) {
          this.callbacks.onError(error)
        }
      }
    }, 2000) // Poll every 2 seconds
  }

  public stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isPolling = false
    console.log('Stopped chat polling')
  }

  public onNewMessage(callback: (message: any) => void) {
    this.callbacks.onNewMessage = callback
  }

  public onError(callback: (error: any) => void) {
    this.callbacks.onError = callback
  }

  public async sendMessage(roomId: string, userId: string, content: string, type: string = 'TEXT') {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          userId,
          content,
          type
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Message sent successfully:', data.message)
        return data.message
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  public async joinRoom(roomId: string, userId: string) {
    try {
      const response = await fetch('/api/chat/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          userId
        })
      })

      if (response.ok) {
        console.log('Joined room successfully')
        return true
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Error joining room:', error)
      throw error
    }
  }

  public async markMessageAsRead(messageId: string, userId: string) {
    try {
      const response = await fetch('/api/chat/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          userId
        })
      })

      if (response.ok) {
        console.log('Message marked as read')
        return true
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }
}

export const chatPollingService = ChatPollingService.getInstance()
export default chatPollingService
