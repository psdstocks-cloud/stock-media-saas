'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Settings, Save, RefreshCw, LogOut, User, Home, Menu, X } from 'lucide-react'
import Link from 'next/link'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

const navigationItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Settings },
  { href: '/admin/users', label: 'Users', icon: Settings },
  { href: '/admin/orders', label: 'Orders', icon: Settings },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/approvals', label: 'Approvals', icon: Settings },
]

interface Props {
  user: AdminUser
}

export default function AdminSettingsClient({ user }: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
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

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Link href="/" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                <Home className="h-5 w-5" />
                <span className="font-semibold">Back to Site</span>
              </Link>
              
              <div className="hidden lg:block w-px h-6 bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                  {user.role}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`
          w-64 bg-white border-r border-gray-200 min-h-screen
          fixed lg:static inset-y-0 left-0 z-40 pt-16 lg:pt-0
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-200 ease-in-out
        `}>
          <nav className="p-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = window.location.pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
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
        </main>
      </div>
    </div>
  )
}