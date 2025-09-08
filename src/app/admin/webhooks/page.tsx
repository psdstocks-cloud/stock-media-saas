'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
    url: 'https://webhook.site/',
    downloadStatusEnabled: false,
    accountStatusEnabled: false,
    telegramEnabled: false
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  // Test webhook URL
  const testWebhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/nehtw`

  useEffect(() => {
    // Load current configuration
    loadWebhookConfig()
  }, [])

  const loadWebhookConfig = async () => {
    try {
      const response = await fetch('/api/admin/webhook-config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading webhook config:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/webhook-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Webhook configuration saved successfully!' })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save configuration')
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save webhook configuration' })
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    try {
      const response = await fetch(testWebhookUrl, {
        method: 'GET',
        headers: {
          'x-neh-event_name': 'test',
          'x-neh-status': 'success',
          'x-neh-order_id': 'test-order-123'
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Webhook test successful!' })
      } else {
        throw new Error('Test failed')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Webhook test failed' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Webhook Configuration</h1>
            <p className="text-gray-600 mt-2">
              Configure webhook notifications for Nehtw.com API events
            </p>
          </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          {message.type === 'error' ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Webhook URL Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook URL</CardTitle>
            <CardDescription>
              Set the webhook URL to receive notifications from Nehtw.com API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://your-domain.com/api/webhooks/nehtw"
              />
              <p className="text-sm text-gray-500 mt-1">
                This URL will receive GET requests with event information in headers
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={handleTest} variant="outline">
                Test Webhook
              </Button>
              <a
                href="https://webhook.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                Get test URL from webhook.site
              </a>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Current webhook URL:</strong> {testWebhookUrl}
                <br />
                <strong>Method:</strong> GET
                <br />
                <strong>Headers:</strong> x-neh-event_name, x-neh-status, x-neh-order_id, etc.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Event Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Event Subscriptions</CardTitle>
            <CardDescription>
              Subscribe to the events you need for your integration or to monitor your activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Download Status Events */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Download status changing</h4>
                  <p className="text-sm text-gray-600">
                    Any update on your order: new download link available, error, refund...
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="download-webhook"
                      checked={config.downloadStatusEnabled}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, downloadStatusEnabled: checked })
                      }
                    />
                    <Label htmlFor="download-webhook">Webhook</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="download-telegram"
                      checked={config.telegramEnabled}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, telegramEnabled: checked })
                      }
                    />
                    <Label htmlFor="download-telegram">Telegram</Label>
                  </div>
                </div>
              </div>

              {/* Account Status Events */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Stock account status changing</h4>
                  <p className="text-sm text-gray-600">
                    Status of your stock account: daily slot used up, need re-submit, delete...
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="account-webhook"
                      checked={config.accountStatusEnabled}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, accountStatusEnabled: checked })
                      }
                    />
                    <Label htmlFor="account-webhook">Webhook</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="account-telegram"
                      checked={config.telegramEnabled}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, telegramEnabled: checked })
                      }
                    />
                    <Label htmlFor="account-telegram">Telegram</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Request Structure</CardTitle>
            <CardDescription>
              How Nehtw.com will send webhook notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Method</h4>
                <code className="bg-gray-100 px-2 py-1 rounded">GET</code>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Headers</h4>
                <div className="space-y-1 text-sm">
                  <div><code className="bg-red-100 px-1 rounded">x-neh-event_name: xxx</code></div>
                  <div><code className="bg-red-100 px-1 rounded">x-neh-status: xxx</code></div>
                  <div><code className="bg-red-100 px-1 rounded">x-neh-order_id: xxx</code></div>
                  <div><code className="bg-red-100 px-1 rounded">x-neh-download_url: xxx</code></div>
                  <div><code className="bg-red-100 px-1 rounded">x-neh-error: xxx</code></div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Example Request</h4>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`GET /api/webhooks/nehtw HTTP/1.1
Host: your-domain.com
x-neh-event_name: download_status_changed
x-neh-status: completed
x-neh-order_id: order_123
x-neh-download_url: https://download.example.com/file.zip`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Update Configuration'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
