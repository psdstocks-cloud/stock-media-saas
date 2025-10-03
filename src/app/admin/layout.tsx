'use client'

import { Toaster } from 'react-hot-toast'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useAdminAuth } from '@/lib/hooks/useAdminAuth'
import { useAdminPermissions } from '@/lib/hooks/useAdminPermissions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogOut, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, authenticated, loading: authLoading, refresh } = useAdminAuth()
  const { permissions, loading: permissionsLoading } = useAdminPermissions()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/admin/login')
    }
  }

  const roleLabel = (() => {
    if (authLoading) return 'Loading…'
    if (!authenticated || !user) return 'Not Authenticated'
    return user.role
  })()

  const permissionCount = permissions ? permissions.size : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">
          <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant={authenticated ? "default" : "destructive"} 
                title={`Effective permissions: ${permissions ? Array.from(permissions).join(', ') : 'none'}`}
              >
                Role: {roleLabel}
              </Badge>
              <Badge variant="outline">
                {permissionsLoading ? 'Checking permissions…' : `${permissionCount} perms`}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {authenticated && user && (
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={authLoading}
              >
                <RefreshCw className={`h-4 w-4 ${authLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {children}
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
