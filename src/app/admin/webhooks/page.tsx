'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { AdminNavigation } from '@/components/admin/navigation'

interface WebhookConfig {
  url: string
  downloadStatusEnabled: boolean
  accountStatusEnabled: boolean
  telegramEnabled: boolean
}

export default function WebhooksPage() {
  const [config, setConfig] = useState<WebhookConfig>({
    url: '',
    downloadStatusEnabled: false,
    accountStatusEnabled: false,
    telegramEnabled: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/webhook-config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error fetching webhook config:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/webhook-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Webhook configuration saved successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save webhook configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving the configuration' })
    } finally {
      setIsLoading(false)
    }
  }

  const testWebhook = async () => {
    if (!config.url) {
      setMessage({ type: 'error', text: 'Please enter a webhook URL first' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/webhook-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...config, test: true }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test webhook sent successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to send test webhook' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while testing the webhook' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <AdminNavigation />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            Webhook Configuration
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '30px'
          }}>
            Configure webhooks to receive real-time notifications about downloads and account status changes.
          </p>

          {message && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: message.type === 'success' ? '#f0fdf4' : message.type === 'error' ? '#fef2f2' : '#eff6ff',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : message.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
              color: message.type === 'success' ? '#166534' : message.type === 'error' ? '#dc2626' : '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {message.type === 'success' && <CheckCircle size={20} />}
              {message.type === 'error' && <XCircle size={20} />}
              {message.type === 'info' && <AlertTriangle size={20} />}
              {message.text}
            </div>
          )}

          <div style={{ display: 'grid', gap: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Webhook URL
              </label>
              <input
                type="url"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://your-webhook-url.com/endpoint"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Notification Types
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#374151' }}>Download Status</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Notify when downloads complete or fail</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={config.downloadStatusEnabled}
                    onChange={(e) => setConfig({ ...config, downloadStatusEnabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: config.downloadStatusEnabled ? '#667eea' : '#ccc',
                    transition: '0.4s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.4s',
                      borderRadius: '50%',
                      transform: config.downloadStatusEnabled ? 'translateX(20px)' : 'translateX(0)'
                    }} />
                  </span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#374151' }}>Account Status</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Notify about account changes and updates</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={config.accountStatusEnabled}
                    onChange={(e) => setConfig({ ...config, accountStatusEnabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: config.accountStatusEnabled ? '#667eea' : '#ccc',
                    transition: '0.4s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.4s',
                      borderRadius: '50%',
                      transform: config.accountStatusEnabled ? 'translateX(20px)' : 'translateX(0)'
                    }} />
                  </span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#374151' }}>Telegram Notifications</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Send notifications to Telegram bot</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={config.telegramEnabled}
                    onChange={(e) => setConfig({ ...config, telegramEnabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: config.telegramEnabled ? '#667eea' : '#ccc',
                    transition: '0.4s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.4s',
                      borderRadius: '50%',
                      transform: config.telegramEnabled ? 'translateX(20px)' : 'translateX(0)'
                    }} />
                  </span>
                </label>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={handleSave}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>

              <button
                onClick={testWebhook}
                disabled={isLoading || !config.url}
                style={{
                  padding: '12px 24px',
                  background: config.url ? 'linear-gradient(135deg, #10b981, #059669)' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (isLoading || !config.url) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || !config.url) ? 0.7 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && config.url) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && config.url) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <ExternalLink size={16} />
                Test Webhook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}