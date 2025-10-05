'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Coins, User, Download, Calendar, LogOut } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
}

interface PointsData {
  currentPoints: number
  totalEarned: number
  totalSpent: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [points, setPoints] = useState<PointsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      console.log('📊 Loading user dashboard data...')
      
      // Check auth status
      const authResponse = await fetch('/api/auth/status', {
        credentials: 'include'
      })
      
      const authData = await authResponse.json()
      
      if (!authData.authenticated) {
        router.push('/login?redirect=/dashboard')
        return
      }
      
      setUser(authData.user)
      
      // Load points data
      const pointsResponse = await fetch('/api/points', {
        credentials: 'include'
      })
      
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json()
        if (pointsData.success) {
          setPoints(pointsData.summary)
        }
      }
      
    } catch (err) {
      console.error('❌ Error loading dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <Typography variant="body" className="text-white">Loading dashboard...</Typography>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Typography variant="h3" className="text-red-500 mb-2">Error</Typography>
            <Typography variant="body" className="text-gray-600 mb-4">{error}</Typography>
            <Button onClick={loadUserData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Typography variant="h1" className="text-3xl font-bold text-white">
              Welcome back, {user?.name || user?.email}!
            </Typography>
            <Typography variant="body" className="text-white/70 mt-2">
              Manage your stock media downloads and points
            </Typography>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === 'SUPER_ADMIN' && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin')}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Admin Panel
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center">
                <Coins className="h-5 w-5 mr-2 text-orange-500" />
                Current Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {points?.currentPoints || 0}
              </div>
              <p className="text-white/70 text-sm">Available for downloads</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center">
                <Download className="h-5 w-5 mr-2 text-green-500" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {points?.totalEarned || 0}
              </div>
              <p className="text-white/70 text-sm">Points earned all-time</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {points?.totalSpent || 0}
              </div>
              <p className="text-white/70 text-sm">Points used for downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        <Card className="bg-white/10 border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-white/70 text-sm">Email:</span>
              <div className="text-white">{user?.email}</div>
            </div>
            <div>
              <span className="text-white/70 text-sm">Role:</span>
              <div className="text-white">{user?.role}</div>
            </div>
            <div>
              <span className="text-white/70 text-sm">Account Status:</span>
              <div className="text-green-400">Active</div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Browse Stock Media
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Download History
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  )
}