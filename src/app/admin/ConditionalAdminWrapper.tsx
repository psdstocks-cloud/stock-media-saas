'use client'

import { usePathname } from 'next/navigation'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import AdminLayout from './AdminLayout'

export default function ConditionalAdminWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Don't wrap login page with admin context
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <AdminAuthProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminAuthProvider>
  )
}
