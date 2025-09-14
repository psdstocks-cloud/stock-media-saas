'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  LogOut, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  User,
  Lock,
  Activity,
  AlertTriangle
} from 'lucide-react'
import AdminNotificationCenter from './AdminNotificationCenter'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [sessionTimeout, setSessionTimeout] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState([
    {
      id: 1,
      title: 'New User Registration',
      message: 'A new user has registered on the platform',
      time: '2 minutes ago',
      type: 'info'
    },
    {
      id: 2,
      title: 'System Update',
      message: 'Scheduled maintenance completed successfully',
      time: '1 hour ago',
      type: 'success'
    },
    {
      id: 3,
      title: 'High Traffic Alert',
      message: 'Server load is above normal levels',
      time: '3 hours ago',
      type: 'warning'
    }
  ])

  // Session timeout management
  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login')
      return
    }

    // Track user activity
    const updateActivity = () => setLastActivity(Date.now())
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    // Check for session timeout every minute
    const timeoutCheck = setInterval(() => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivity
      
      // 30 minutes of inactivity
      if (timeSinceActivity > 30 * 60 * 1000) {
        setSessionTimeout(true)
        clearInterval(timeoutCheck)
      }
    }, 60000)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(timeoutCheck)
    }
  }, [session, status, router, lastActivity])

  // Auto-logout on session timeout
  useEffect(() => {
    if (sessionTimeout) {
      const timer = setTimeout(() => {
        signOut({ callbackUrl: '/admin/login' })
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [sessionTimeout])

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  const handleExtendSession = () => {
    setLastActivity(Date.now())
    setSessionTimeout(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex'
    }}>
      {/* Session Timeout Modal */}
      {sessionTimeout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
          }}>
            <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Session Timeout
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Your session will expire in 5 seconds due to inactivity. Click below to extend your session.
            </p>
            <button
              onClick={handleExtendSession}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '12px'
              }}
            >
              Extend Session
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '0',
        background: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 100%)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 1000
      }}>
        <div style={{ padding: '24px' }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={24} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                margin: 0
              }}>
                Admin Portal
              </h2>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0
              }}>
                Stock Media SaaS
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { href: '/admin', label: 'Dashboard', icon: Activity },
              { href: '/admin/users', label: 'Users', icon: User },
              { href: '/admin/orders', label: 'Orders', icon: Settings },
              { href: '/admin/chat', label: 'Support Chat', icon: Settings },
              { href: '/admin/settings', label: 'Settings', icon: Settings }
            ].map((item) => (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  background: 'rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <item.icon size={20} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </nav>

          {/* User Info */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            right: '24px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={16} color="white" />
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  margin: 0
                }}>
                  {session.user?.name || session.user?.email}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0
                }}>
                  {session.user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#fca5a5',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Bar */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                color: '#6b7280'
              }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#f3f4f6',
              borderRadius: '8px',
              minWidth: '300px'
            }}>
              <Search size={16} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search admin panel..."
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#374151',
                  flex: 1
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: showNotifications ? '#f3f4f6' : 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                color: '#6b7280',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <Bell size={20} />
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%'
              }} />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                width: '320px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e5e7eb',
                zIndex: 1000,
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '18px'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ padding: '8px' }}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        borderLeft: `3px solid ${
                          notification.type === 'info' ? '#3b82f6' :
                          notification.type === 'success' ? '#10b981' :
                          notification.type === 'warning' ? '#f59e0b' : '#6b7280'
                        }`
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>
                        {notification.time}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  padding: '12px',
                  borderTop: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    View All Notifications
                  </button>
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <Lock size={16} color="#10b981" />
              <span style={{
                fontSize: '12px',
                color: '#10b981',
                fontWeight: '600'
              }}>
                Secure Session
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '24px' }}>
          {children}
        </main>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Admin Notification Center */}
      <AdminNotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  )
}
