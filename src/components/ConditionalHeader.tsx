'use client'

import { usePathname } from 'next/navigation'
import UserHeader from '@/components/layout/UserHeader'

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't show any header on admin routes (admin has its own layout)
  if (pathname.startsWith('/admin')) {
    return null
  }
  
  // Don't show header on login pages with clean design
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    return null
  }
  
  // Show user header for all other routes
  return <UserHeader />
}
