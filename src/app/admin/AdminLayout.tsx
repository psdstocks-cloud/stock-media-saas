'use client'

import { Toaster } from 'react-hot-toast'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { LogOut, RefreshCw, Shield, User, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, authenticated, loading, error, logout, refresh } = useAdminAuth()
  const router = useRouter()

  // Redirect to login if not authenticated (but only after we've actually tried to authenticate)
  useEffect(() => {
    if (!loading && !authenticated && !error) {
      // Only redirect if we're not on the login page already
      if (window.location.pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    }
  }, [authenticated, loading, error, router])

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <Typography variant="h3" className="text-foreground">
            Loading Admin Panel...
          </Typography>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <Typography variant="h3" className="text-foreground">
            Authentication Error
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            {error}
          </Typography>
          <div className="space-x-2">
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => router.push('/admin/login')} variant="default">
              <Shield className="h-4 w-4 mr-2" />
              Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!authenticated || !user) {
    return null // Will redirect to login
  }

  const roleLabel = user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'
  const roleColor = user.role === 'SUPER_ADMIN' ? 'bg-red-500' : 'bg-orange-500'

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">
          {/* Admin Status Bar */}
          <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge 
                className={`${roleColor} text-white font-semibold px-3 py-1`}
              >
                <Shield className="h-3 w-3 mr-1" />
                {roleLabel}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <User className="h-3 w-3 mr-1" />
                {user.email}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="hover:bg-muted"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--primary))',
              secondary: 'hsl(var(--primary-foreground))',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'hsl(var(--destructive-foreground))',
            },
          },
        }}
      />
    </div>
  )
}
