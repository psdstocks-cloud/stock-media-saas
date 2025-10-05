'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { ThemedIcon } from '@/components/admin/ThemedIcon'


export default function AdminSettingsClient() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography 
            variant="h2" 
            className="text-2xl font-bold"
            style={{ color: 'var(--admin-text-primary)' }}
          >
            System Settings
          </Typography>
          <Typography 
            variant="body" 
            className="mt-1"
            style={{ color: 'var(--admin-text-secondary)' }}
          >
            Configure platform settings and preferences
          </Typography>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2"
          style={{
            backgroundColor: 'var(--admin-accent)',
            color: 'white'
          }}
        >
          {isSaving ? (
            <ThemedIcon 
              icon={RefreshCw}
              className="h-4 w-4 animate-spin"
              style={{ color: 'white' }}
            />
          ) : (
            <ThemedIcon 
              icon={Save}
              className="h-4 w-4"
              style={{ color: 'white' }}
            />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      {/* General Settings */}
      <Card
        style={{
          backgroundColor: 'var(--admin-bg-card)',
          borderColor: 'var(--admin-border)',
          color: 'var(--admin-text-primary)'
        }}
      >
        <CardHeader>
          <CardTitle 
            className="flex items-center space-x-2"
            style={{ color: 'var(--admin-text-primary)' }}
          >
            <ThemedIcon 
              icon={Settings}
              className="h-5 w-5" 
              style={{ color: 'var(--admin-accent)' }}
            />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Site Name
            </label>
            <Input
              value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              placeholder="Enter site name"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-primary)'
              }}
            />
          </div>
          
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Site Description
            </label>
            <Input
              value={settings.siteDescription}
              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              placeholder="Enter site description"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-primary)'
              }}
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
            <label 
              htmlFor="maintenanceMode" 
              className="text-sm font-medium"
              style={{ color: 'var(--admin-text-primary)' }}
            >
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
            <label 
              htmlFor="registrationEnabled" 
              className="text-sm font-medium"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Allow New User Registrations
            </label>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Settings */}
      <Card
        style={{
          backgroundColor: 'var(--admin-bg-card)',
          borderColor: 'var(--admin-border)',
          color: 'var(--admin-text-primary)'
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: 'var(--admin-text-primary)' }}>
            File Upload Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Maximum File Size
            </label>
            <Input
              value={settings.maxFileSize}
              onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
              placeholder="e.g., 10MB"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-primary)'
              }}
            />
          </div>
          
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Supported File Formats
            </label>
            <Input
              value={settings.supportedFormats}
              onChange={(e) => setSettings({...settings, supportedFormats: e.target.value})}
              placeholder="e.g., JPG, PNG, MP4, MOV, AI, EPS"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-primary)'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card
        style={{
          backgroundColor: 'var(--admin-bg-card)',
          borderColor: 'var(--admin-border)',
          color: 'var(--admin-text-primary)'
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: 'var(--admin-text-primary)' }}>
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="text-sm"
            style={{ color: 'var(--admin-text-secondary)' }}
          >
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