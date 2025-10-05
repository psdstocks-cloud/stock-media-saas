'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      console.log('🔍 [Dashboard Layout] Checking authentication...')
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          console.log('✅ [Dashboard Layout] User authenticated')
          setIsAuthenticated(true)
        } else {
          console.log('❌ [Dashboard Layout] User not authenticated, redirecting...')
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        }
      } else {
        console.log('❌ [Dashboard Layout] Auth check failed, redirecting...')
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      }
    } catch (error) {
      console.error('❌ [Dashboard Layout] Auth check error:', error)
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar will be rendered by SmartHeader component */}
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}