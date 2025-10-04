'use client'

import { Toaster } from 'react-hot-toast'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { MobileSidebar } from '@/components/admin/MobileSidebar'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Typography } from '@/components/ui/typography'
import { AlertCircle, RefreshCw, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, authenticated, loading, error, refresh } = useAdminAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/admin/login')
    }
  }, [authenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single Header for Admin Area */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <MobileSidebar />
            <h1 className="text-xl font-semibold text-gray-900">StockMedia Pro Admin</h1>
            <div className="hidden sm:block text-sm text-gray-500">
              Welcome back, <span className="font-medium text-orange-600">{user.email}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {user.role}
            </span>
            <a 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Back to Site
            </a>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">
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