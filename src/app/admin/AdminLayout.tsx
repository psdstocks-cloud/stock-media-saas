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
import { AdminThemeWrapper, ThemeToggle } from '@/components/admin/AdminThemeWrapper'

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
      <AdminThemeWrapper>
        <div className="min-h-screen flex items-center justify-center" style={{
          backgroundColor: 'var(--admin-bg-primary)',
          color: 'var(--admin-text-primary)'
        }}>
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <Typography variant="h3" style={{ color: 'var(--admin-text-primary)' }}>
              Loading Admin Panel...
            </Typography>
          </div>
        </div>
      </AdminThemeWrapper>
    )
  }

  if (error) {
    return (
      <AdminThemeWrapper>
        <div className="min-h-screen flex items-center justify-center" style={{
          backgroundColor: 'var(--admin-bg-primary)',
          color: 'var(--admin-text-primary)'
        }}>
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <Typography variant="h3" style={{ color: 'var(--admin-text-primary)' }}>
              Authentication Error
            </Typography>
            <Typography variant="body" style={{ color: 'var(--admin-text-secondary)' }}>
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
      </AdminThemeWrapper>
    )
  }

  if (!authenticated || !user) {
    return null // Will redirect to login
  }

  return (
    <AdminThemeWrapper>
      <div className="min-h-screen" style={{
        backgroundColor: 'var(--admin-bg-primary)',
        color: 'var(--admin-text-primary)'
      }}>
        {/* Theme-aware Header for Admin Area */}
        <header className="shadow-sm border-b" style={{
          backgroundColor: 'var(--admin-bg-card)',
          borderColor: 'var(--admin-border)'
        }}>
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <MobileSidebar />
              <h1 className="text-xl font-semibold" style={{ color: 'var(--admin-text-primary)' }}>
                StockMedia Pro Admin
              </h1>
              <div className="hidden sm:block text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                Welcome back, <span className="font-medium" style={{ color: 'var(--admin-accent)' }}>{user.email}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
                backgroundColor: 'var(--admin-accent)',
                color: 'white'
              }}>
                {user.role}
              </span>
              <a 
                href="/" 
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--admin-text-secondary)' }}
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
              background: 'var(--admin-bg-card)',
              color: 'var(--admin-text-primary)',
              border: '1px solid var(--admin-border)',
            },
            success: {
              iconTheme: {
                primary: 'var(--admin-accent)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </AdminThemeWrapper>
  )
}