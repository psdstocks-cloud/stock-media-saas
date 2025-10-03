'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Lock } from 'lucide-react'
import KPICards from '@/components/admin/KPICards'
import RevenueChart from '@/components/admin/RevenueChart'
import RecentOrdersList from '@/components/admin/RecentOrdersList'
import RecentUsersList from '@/components/admin/RecentUsersList'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

export default function AdminDashboardClient() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('🔍 Dashboard: Checking authentication...')
        
        // Check for admin auth token cookie
        const hasAuthToken = document.cookie.includes('auth-token=')
        
        if (!hasAuthToken) {
          console.log('❌ Dashboard: No auth token found')
          // Clear any redirect flags to prevent loop
          router.replace('/admin/login?from=dashboard')
          return
        }

        // Verify the admin session with the server
        const response = await fetch('/api/admin/verify-session', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        const data = await response.json()
        console.log('🔍 Dashboard: Session verification response:', { status: response.status, data })

        if (response.ok && data.success && data.user) {
          // Check if user has admin role
          if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
            console.log('✅ Dashboard: Valid admin session found')
            setUser(data.user)
            setIsAuthenticated(true)
          } else {
            console.log('❌ Dashboard: User does not have admin privileges')
            router.replace('/admin/login?error=insufficient_privileges')
            return
          }
        } else {
          console.log('❌ Dashboard: Invalid session, redirecting to login')
          // Clear auth token cookie if session is invalid
          document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
          router.replace('/admin/login?from=dashboard')
          return
        }
      } catch (error) {
        console.error('❌ Dashboard: Authentication check failed:', error)
        router.replace('/admin/login?error=auth_check_failed')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="flex items-center space-x-4 p-8">
            <RefreshCw className="h-8 w-8 text-orange-400 animate-spin" />
            <div>
              <Typography variant="h4" className="text-white font-semibold">
                Loading Admin Panel...
              </Typography>
              <Typography variant="body" className="text-white/70 mt-1">
                Verifying your admin credentials
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show access denied if not authenticated (shouldn't reach here due to redirects)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="flex items-center space-x-4 p-8">
            <Lock className="h-8 w-8 text-red-400" />
            <div>
              <Typography variant="h4" className="text-white font-semibold">
                Access Denied
              </Typography>
              <Typography variant="body" className="text-white/70 mt-1">
                Redirecting to login page...
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render the authenticated admin dashboard
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">
            Admin Dashboard
          </Typography>
          <Typography variant="body" color="muted" className="mt-2">
            Welcome back, {user.name || user.email}! Here's your platform overview.
          </Typography>
        </div>
        <div className="text-right">
          <Typography variant="caption" color="muted">
            Logged in as: <span className="font-medium">{user.email}</span>
          </Typography>
          <Typography variant="caption" color="muted" className="block">
            Role: <span className="font-medium text-orange-600">{user.role}</span>
          </Typography>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersList />
        <RecentUsersList />
      </div>
    </div>
  )
}