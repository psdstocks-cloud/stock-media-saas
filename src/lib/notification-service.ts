// src/lib/notification-service.ts

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  actions?: NotificationAction[]
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

class NotificationService {
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: false
  }

  private isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported in this browser')
      return this.permission
    }

    try {
      const permission = await Notification.requestPermission()
      
      this.permission = {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
      }

      return this.permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return this.permission
    }
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported() || !this.permission.granted) {
      console.warn('Notifications not available or permission not granted')
      return
    }

    try {
      // Check if we're in a service worker context
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Send message to service worker to show notification
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          options
        })
      } else {
        // Fallback to direct notification
        const notificationOptions: any = {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          badge: options.badge || '/favicon.ico',
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false
        }

        // Add vibrate and actions if supported
        if (options.vibrate) {
          notificationOptions.vibrate = options.vibrate
        }
        if (options.actions) {
          notificationOptions.actions = options.actions
        }

        const notification = new Notification(options.title, notificationOptions)

        // Auto-close after 5 seconds unless requireInteraction is true
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close()
          }, 5000)
        }

        // Handle notification click
        notification.onclick = (event) => {
          event.preventDefault()
          window.focus()
          notification.close()
          
          // Emit custom event for handling notification clicks
          window.dispatchEvent(new CustomEvent('notification-click', {
            detail: { notification, data: options.data }
          }))
        }
      }
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  async showChatNotification(message: {
    id: string
    content: string
    senderName: string
    roomName?: string
    type: string
  }): Promise<void> {
    const isImage = message.type === 'IMAGE'
    const isFile = message.type === 'FILE'
    
    let title = `New message from ${message.senderName}`
    let body = message.content

    if (message.roomName) {
      title = `${message.roomName} - ${title}`
    }

    if (isImage) {
      body = '📷 Sent an image'
    } else if (isFile) {
      body = '📎 Sent a file'
    } else if (body.length > 100) {
      body = body.substring(0, 100) + '...'
    }

    await this.showNotification({
      title,
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `chat-${message.id}`,
      data: {
        messageId: message.id,
        roomName: message.roomName,
        senderName: message.senderName,
        type: 'chat-message'
      },
      requireInteraction: false,
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/icons/reply.svg'
        },
        {
          action: 'mark-read',
          title: 'Mark as Read',
          icon: '/icons/check.svg'
        }
      ]
    })
  }

  getPermissionStatus(): NotificationPermission {
    return { ...this.permission }
  }

  isPermissionGranted(): boolean {
    return this.permission.granted
  }

  // Check if user is currently focused on the page
  isPageVisible(): boolean {
    return !document.hidden
  }

  // Check if user is in the chat page
  isInChatPage(): boolean {
    return window.location.pathname.includes('/dashboard/chat') || 
           window.location.pathname.includes('/admin/chat')
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export for use in components
export default notificationService
