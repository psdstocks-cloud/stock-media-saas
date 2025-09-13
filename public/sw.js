// public/sw.js - Service Worker for Push Notifications

const CACHE_NAME = 'stock-media-saas-v1'
const NOTIFICATION_ICON = '/favicon.ico'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Message event handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const options = event.data.options
    showNotification(options)
  }
})

// Push event handler (for future push notifications)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)
  
  if (event.data) {
    const data = event.data.json()
    showNotification({
      title: data.title || 'New Message',
      body: data.body || 'You have a new message',
      icon: data.icon || NOTIFICATION_ICON,
      badge: data.badge || NOTIFICATION_ICON,
      tag: data.tag,
      data: data.data,
      requireInteraction: data.requireInteraction || false,
      actions: data.actions
    })
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  const data = event.notification.data || {}
  const action = event.action
  
  // Handle different actions
  if (action === 'reply') {
    // Focus on chat and open reply
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/dashboard/chat') || client.url.includes('/admin/chat')) {
            return client.focus()
          }
        }
        // If no chat window is open, open one
        return clients.openWindow('/dashboard/chat')
      })
    )
  } else if (action === 'mark-read') {
    // Mark message as read
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({
            type: 'MARK_MESSAGE_READ',
            messageId: data.messageId
          })
        }
      })
    )
  } else {
    // Default click behavior - focus on chat
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/dashboard/chat') || client.url.includes('/admin/chat')) {
            return client.focus()
          }
        }
        // If no chat window is open, open one
        return clients.openWindow('/dashboard/chat')
      })
    )
  }
})

// Helper function to show notification
function showNotification(options) {
  const notificationOptions = {
    body: options.body,
    icon: options.icon || NOTIFICATION_ICON,
    badge: options.badge || NOTIFICATION_ICON,
    tag: options.tag,
    data: options.data,
    requireInteraction: options.requireInteraction || false,
    silent: options.silent || false,
    vibrate: options.vibrate,
    actions: options.actions || []
  }

  return self.registration.showNotification(options.title, notificationOptions)
}

// Background sync for offline message queuing (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-messages') {
    console.log('Background sync for messages')
    // Implement offline message queuing here
  }
})
