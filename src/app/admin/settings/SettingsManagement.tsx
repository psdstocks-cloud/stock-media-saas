'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Settings, Save, RefreshCw } from 'lucide-react'

export default function SettingsManagement() {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'StockMedia Pro',
    siteDescription: 'Premium stock media downloads',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: '10MB',
    supportedFormats: 'JPG, PNG, MP4, MOV, AI, EPS'
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="text-2xl font-bold">
            System Settings
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Configure platform settings and preferences
          </Typography>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <Input
              value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              placeholder="Enter site name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <Input
              value={settings.siteDescription}
              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              placeholder="Enter site description"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
              Enable Maintenance Mode
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="registrationEnabled"
              checked={settings.registrationEnabled}
              onChange={(e) => setSettings({...settings, registrationEnabled: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="registrationEnabled" className="text-sm font-medium text-gray-700">
              Allow New User Registrations
            </label>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum File Size
            </label>
            <Input
              value={settings.maxFileSize}
              onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
              placeholder="e.g., 10MB"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supported File Formats
            </label>
            <Input
              value={settings.supportedFormats}
              onChange={(e) => setSettings({...settings, supportedFormats: e.target.value})}
              placeholder="e.g., JPG, PNG, MP4, MOV, AI, EPS"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>• JWT tokens expire after 15 minutes</p>
            <p>• Refresh tokens expire after 7 days</p>
            <p>• Rate limiting: 5 login attempts per 15 minutes</p>
            <p>• All admin actions are logged for audit</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
