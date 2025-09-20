'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Typography, Button } from '@/components/ui'
import { User, LogOut, Shield, Settings, Download, Search } from 'lucide-react'

interface DashboardUser {
  id: string
  email: string
  name: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('Verifying authentication...')
        const response = await fetch('/api/auth/verify-token')
        console.log('Auth verification response status:', response.status)
        
        if (!response.ok) {
          console.log('Auth verification failed, redirecting to login')
          router.push('/login')
          return
        }
        
        const data = await response.json()
        console.log('Auth verification data:', data)
        
        if (data && data.valid && data.user) {
          console.log('User authenticated:', data.user)
          setUser(data.user)
        } else {
          console.log('Invalid auth data, redirecting to login')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth verification error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      console.log('Logging out...')
      await fetch('/api/auth/logout', { method: 'POST' })
      console.log('Logout successful, redirecting to login')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <Typography variant="body" className="text-white/70">Loading...</Typography>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Typography variant="body" className="text-white/70 mb-4">
              Please log in to access the dashboard.
            </Typography>
            <Button 
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SM</span>
              </div>
              <div>
                <Typography variant="h2" className="text-white font-bold text-xl">
                  Stock Media SaaS
                </Typography>
                <Typography variant="body" className="text-white/70 text-sm">
                  Welcome back, {user.name}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/70">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.role}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => alert('Search functionality coming soon!')}
              >
                <Search className="h-4 w-4 mr-2" />
                Search Stock Media
              </Button>
              <Button 
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
                onClick={() => alert('Downloads coming soon!')}
              >
                <Download className="h-4 w-4 mr-2" />
                View Downloads
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-white/70">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="text-white">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="text-orange-400 capitalize">{user.role.toLowerCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          {user.role === 'admin' || user.role === 'SUPER_ADMIN' ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10"
                  onClick={() => alert('Settings coming soon!')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Welcome Message */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl mt-8">
          <CardHeader>
            <CardTitle className="text-white">Welcome to Stock Media SaaS!</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body" className="text-white/70">
              You have successfully logged in to your Stock Media SaaS account. 
              The full dashboard functionality is being restored. In the meantime, 
              you can access your account information and basic features above.
            </Typography>
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <Typography variant="body" className="text-orange-200 text-sm">
                <strong>Note:</strong> The full dashboard features are temporarily disabled while we resolve 
                some technical issues. We're working to restore all functionality as quickly as possible.
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
