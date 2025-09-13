'use client'

import { useState, useEffect } from 'react'
import { notificationService, NotificationPermission as NotificationPermissionType } from '@/lib/notification-service'
import { Bell, BellOff, Settings, X } from 'lucide-react'

interface NotificationPermissionProps {
  onPermissionChange?: (permission: NotificationPermissionType) => void
  className?: string
}

export default function NotificationPermission({ 
  onPermissionChange, 
  className = '' 
}: NotificationPermissionProps) {
  const [permission, setPermission] = useState<NotificationPermissionType>({
    granted: false,
    denied: false,
    default: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check current permission status
    const currentPermission = notificationService.getPermissionStatus()
    setPermission(currentPermission)
    
    // Show banner if permission is default (not requested yet)
    if (currentPermission.default) {
      setIsVisible(true)
    }
  }, [])

  const handleRequestPermission = async () => {
    setIsLoading(true)
    try {
      const newPermission = await notificationService.requestPermission()
      setPermission(newPermission)
      setIsVisible(false)
      onPermissionChange?.(newPermission)
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  // Don't show if permission is already granted or denied
  if (permission.granted || permission.denied || !isVisible) {
    return null
  }

  return (
    <div className={`notification-permission-banner ${className}`} style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      zIndex: 1000,
      maxWidth: '320px',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Bell size={20} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: 'white'
          }}>
            Enable Notifications
          </h3>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.4'
          }}>
            Get notified when you receive new messages in chat
          </p>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              onClick={handleRequestPermission}
              disabled={isLoading}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell size={12} />
                  Enable
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
