'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminChatDashboard from '@/components/chat/AdminChatDashboard'
import AdminNotificationCenter from '@/components/admin/AdminNotificationCenter'
import { 
  ArrowLeft, 
  MessageCircle, 
  Shield,
  Settings,
  Bell,
  BarChart3
} from 'lucide-react'

export default function AdminChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/admin/login')
      return
    }

    // Debug logging
    console.log('Admin Chat Page - Session data:', {
      user: session.user,
      role: session.user.role,
      isAdmin: session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    })

    // Check if user is admin or super admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      console.log('User is not admin, redirecting to dashboard')
      router.push('/dashboard')
      return
    }

    console.log('User is admin, proceeding to admin dashboard')
    setIsAdmin(true)
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
          <p style={{ color: '#333', fontSize: '16px' }}>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <Shield size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 8px', color: '#1f2937' }}>Access Denied</h2>
          <p style={{ margin: 0, color: '#6b7280' }}>You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
            onClick={() => router.push('/admin')}
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
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1f2937' 
              }}>
                Admin Chat Dashboard
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#6b7280' 
              }}>
                Manage customer support conversations
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fef2f2',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid #fecaca'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#dc2626' }}>
              Live Support
            </span>
          </div>
          
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            style={{
              padding: '8px',
              border: 'none',
              background: showAnalytics ? '#3b82f6' : '#f3f4f6',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showAnalytics ? 'white' : '#6b7280',
              transition: 'all 0.2s ease'
            }}
            title="Analytics"
          >
            <BarChart3 size={16} />
          </button>
          
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              padding: '8px',
              border: 'none',
              background: showNotifications ? '#3b82f6' : '#f3f4f6',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showNotifications ? 'white' : '#6b7280',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            title="Notifications"
          >
            <Bell size={16} />
            {/* Notification badge */}
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: '8px',
              border: 'none',
              background: showSettings ? '#3b82f6' : '#f3f4f6',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showSettings ? 'white' : '#6b7280',
              transition: 'all 0.2s ease'
            }}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Admin Chat Dashboard */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AdminChatDashboard onRoomSelect={(room) => {
          console.log('Room selected in admin:', room)
        }} />
      </div>

      {/* Notification Center */}
      <AdminNotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* Analytics Modal */}
      {showAnalytics && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '400px',
          maxHeight: '600px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Chat Analytics
            </h3>
            <button
              onClick={() => setShowAnalytics(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                Active Conversations
              </h4>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                12
              </p>
            </div>
            
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                Messages Today
              </h4>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
                156
              </p>
            </div>
            
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                Avg Response Time
              </h4>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                2.3m
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '400px',
          maxHeight: '600px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Chat Settings
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                Auto-assign conversations
              </span>
              <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                Sound notifications
              </span>
              <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                Email notifications
              </span>
              <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
