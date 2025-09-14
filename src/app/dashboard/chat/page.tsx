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
  const [showNewChatModal, setShowNewChatModal] = useState(false)

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
            onClick={() => setShowNewChatModal(true)}
            style={{
              padding: '8px 16px',
              border: '1px solid #e2e8f0',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8fafc'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            <Plus size={16} />
            New Chat
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
            onClick={() => {
              // Open settings or show settings modal
              alert('Settings functionality coming soon!')
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
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Chat Interface */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatInterface />
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
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
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Start New Chat
            </h3>
            <p style={{
              margin: '0 0 20px 0',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              A new support chat will be created for you. Our team will respond as soon as possible.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowNewChatModal(false)}
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
                Cancel
              </button>
              <button
                onClick={() => {
                  // Create new chat room logic here
                  alert('New chat created! (This will be implemented with the API)')
                  setShowNewChatModal(false)
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
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
