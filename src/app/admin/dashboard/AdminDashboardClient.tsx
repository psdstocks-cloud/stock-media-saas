'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Typography } from '@/components/ui/typography'
import KPICards from '@/components/admin/KPICards'
import RevenueChart from '@/components/admin/RevenueChart'
import RecentOrdersList from '@/components/admin/RecentOrdersList'
import RecentUsersList from '@/components/admin/RecentUsersList'

// Removed unused Props interface


export default function AdminDashboardClient() {
  const [user, setUser] = useState<{
    id: string
    email: string
    name?: string
    role: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [_isLoggingOut, _setIsLoggingOut] = useState(false)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/me', {
          credentials: 'include',
          cache: 'no-cache'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            setUser(data.user)
          } else {
            router.replace('/admin/login')
          }
        } else {
          router.replace('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.replace('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])


  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <Typography 
          variant="h2" 
          className="text-2xl font-bold"
          style={{ color: 'var(--admin-text-primary)' }}
        >
          Dashboard Overview
        </Typography>
        <Typography 
          variant="body" 
          className="mt-2"
          style={{ color: 'var(--admin-text-secondary)' }}
        >
          Welcome back, {user.name || user.email}! Here's your platform overview.
        </Typography>
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