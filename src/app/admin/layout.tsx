'use client'

import { Toaster } from 'react-hot-toast'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { Badge } from '@/components/ui/badge'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { permissions, loading } = usePermissions()

  const roleLabel = (() => {
    // Best-effort: infer role from permissions set size
    const size = permissions ? permissions.size : 0
    if (loading) return 'Loading…'
    if (size > 10) return 'SUPER_ADMIN'
    if (size > 0) return 'ADMIN'
    return 'USER'
  })()

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">
          <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur p-3 flex items-center justify-end gap-2">
            <Badge variant="secondary" title={`Effective permissions: ${permissions ? Array.from(permissions).join(', ') : 'none'}`}>
              Role: {roleLabel}
            </Badge>
            <Badge variant="outline">
              {loading ? 'Checking permissions…' : `${permissions ? permissions.size : 0} perms`}
            </Badge>
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
