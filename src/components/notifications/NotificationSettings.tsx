'use client'

import { useState, useEffect } from 'react'
import { notificationService, NotificationPermission as NotificationPermissionType } from '@/lib/notification-service'
import { Bell, BellOff, Settings, Volume2, VolumeX, Moon, Sun, X } from 'lucide-react'

interface NotificationSettingsProps {
  className?: string
}

export default function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const [permission, setPermission] = useState<NotificationPermissionType>({
    granted: false,
    denied: false,
    default: false
  })
  const [settings, setSettings] = useState({
    enabled: true,
    sound: true,
    desktop: true,
    mobile: true,
    doNotDisturb: false
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const currentPermission = notificationService.getPermissionStatus()
    setPermission(currentPermission)
    
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handlePermissionRequest = async () => {
    const newPermission = await notificationService.requestPermission()
    setPermission(newPermission)
  }

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('notification-settings', JSON.stringify(newSettings))
  }

  const getPermissionStatusText = () => {
    if (permission.granted) return 'Enabled'
    if (permission.denied) return 'Blocked'
    return 'Not Set'
  }

  const getPermissionStatusColor = () => {
    if (permission.granted) return '#10b981'
    if (permission.denied) return '#ef4444'
    return '#f59e0b'
  }

  return (
    <div className={`notification-settings ${className}`} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {permission.granted ? <Bell size={16} /> : <BellOff size={16} />}
        <Settings size={14} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          minWidth: '280px',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              margin: '0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Notification Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Permission Status */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Browser Permission
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: getPermissionStatusColor()
              }}>
                {getPermissionStatusText()}
              </span>
            </div>
            
            {!permission.granted && (
              <button
                onClick={handlePermissionRequest}
                style={{
                  width: '100%',
                  background: permission.denied ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {permission.denied ? 'Unblock in Browser Settings' : 'Enable Notifications'}
              </button>
            )}
          </div>

          {/* Notification Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#6b7280" />
                <span style={{
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  Desktop Notifications
                </span>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '40px',
                height: '20px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.desktop}
                  onChange={(e) => handleSettingChange('desktop', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.desktop ? '#3b82f6' : '#d1d5db',
                  borderRadius: '20px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: '2px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: settings.desktop ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} color="#6b7280" />
                <span style={{
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  Sound
                </span>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '40px',
                height: '20px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => handleSettingChange('sound', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.sound ? '#3b82f6' : '#d1d5db',
                  borderRadius: '20px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: '2px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: settings.sound ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Moon size={16} color="#6b7280" />
                <span style={{
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  Do Not Disturb
                </span>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '40px',
                height: '20px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.doNotDisturb}
                  onChange={(e) => handleSettingChange('doNotDisturb', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.doNotDisturb ? '#3b82f6' : '#d1d5db',
                  borderRadius: '20px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: '2px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: settings.doNotDisturb ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
