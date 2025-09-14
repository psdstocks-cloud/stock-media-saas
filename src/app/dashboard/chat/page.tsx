'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/chat/ChatInterface'
import NotificationPermission from '@/components/notifications/NotificationPermission'
import { useServiceWorker } from '@/hooks/useServiceWorker'
import { 
  ArrowLeft, 
  MessageCircle, 
  Plus,
  Settings,
  Users,
  Bell
} from 'lucide-react'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const { isSupported, isRegistered } = useServiceWorker()
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const createNewChat = async () => {
    if (!session?.user?.id) return

    console.log('Creating new chat...')
    setIsCreatingChat(true)
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Support Chat - ${new Date().toLocaleDateString()}`,
          type: 'SUPPORT',
          priority: 'MEDIUM'
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('New chat room created:', data.room)
        alert('Chat room created successfully!')
        
        // Refresh the page to show the new room
        window.location.reload() // Simple refresh to show new room
      } else {
        console.error('Failed to create chat room')
        alert('Failed to create chat room. Please try again.')
      }
    } catch (error) {
      console.error('Error creating chat room:', error)
      alert('Error creating chat room. Please try again.')
    } finally {
      setIsCreatingChat(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#333', fontSize: '16px' }}>Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Notification Permission Banner */}
      <NotificationPermission />
      
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '8px',
              border: 'none',
              background: '#f3f4f6',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <MessageCircle size={20} />
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1f2937' 
              }}>
                Support Chat
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#6b7280' 
              }}>
                Get help from our support team
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={createNewChat}
            disabled={isCreatingChat}
            style={{
              padding: '8px 16px',
              border: '1px solid #e2e8f0',
              background: isCreatingChat ? '#f3f4f6' : 'white',
              borderRadius: '8px',
              cursor: isCreatingChat ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: isCreatingChat ? '#9ca3af' : '#374151',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!isCreatingChat) {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            onMouseOut={(e) => {
              if (!isCreatingChat) {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }
            }}
          >
            {isCreatingChat ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #9ca3af',
                  borderTop: '2px solid #6b7280',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                New Chat
              </>
            )}
          </button>
          
          <button 
            onClick={() => {
              // Request notification permission
              if ('Notification' in window) {
                Notification.requestPermission()
              }
            }}
            style={{
              padding: '8px',
              border: 'none',
              background: '#f3f4f6',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#e5e7eb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
            }}
          >
            <Bell size={16} />
          </button>
          
          <button 
            onClick={() => setShowSettingsModal(true)}
            style={{
              padding: '8px',
              border: 'none',
              background: '#f3f4f6',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#e5e7eb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Chat Interface */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatInterface />
      </div>


      {/* Settings Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Chat Settings
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Notifications
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Desktop Notifications
                </span>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#3b82f6',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Sound Notifications
                </span>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#3b82f6',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Chat Preferences
              </h4>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Auto-refresh messages: <strong>Enabled</strong>
                </span>
              </div>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Message history: <strong>Unlimited</strong>
                </span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Save settings logic here
                  setShowSettingsModal(false)
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: '#3b82f6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'white'
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
