'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = false, redirectTo = '/login' }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (requireAuth && !session?.user) {
      // User is not authenticated and page requires auth
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
    }
  }, [session, status, requireAuth, router, pathname, redirectTo])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      </div>
    )
  }

  // If auth is required and user is not authenticated, don't render children
  if (requireAuth && !session?.user) {
    return null
  }

  return <>{children}</>
}
