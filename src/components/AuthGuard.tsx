'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

interface User {
  id: string
  name: string
  email: string
}

export function AuthGuard({ children, requireAuth = false, redirectTo = '/login' }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (loading) return // Still loading

    if (requireAuth && !user) {
      // User is not authenticated and page requires auth
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
    }
  }, [user, loading, requireAuth, router, pathname, redirectTo])

  // Show loading while checking authentication
  if (loading) {
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
  if (requireAuth && !user) {
    return null
  }

  return <>{children}</>
}
