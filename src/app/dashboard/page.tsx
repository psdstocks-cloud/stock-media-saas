'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  Download, 
  TrendingUp, 
  Calendar,
  Search,
  Star,
  Clock,
  ArrowRight,
  Activity,
  CreditCard
} from 'lucide-react'

interface DashboardStats {
  currentPoints: number
  totalEarned: number
  totalSpent: number
  totalDownloads: number
  monthlyDownloads: number
  accountStatus: string
}

interface RecentActivity {
  id: string
  type: 'DOWNLOAD' | 'POINTS_EARNED' | 'SUBSCRIPTION'
  description: string
  amount?: number
  date: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load user profile with better error handling
      try {
        const profileResponse = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-cache'
        })
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (profileData.authenticated && profileData.user) {
            setUser(profileData.user)
            console.log('✅ [Dashboard] Profile loaded')
          }
        }
      } catch (error) {
        console.log('ℹ️ [Dashboard] Profile error (non-critical):', error)
      }
      
      // Load points data with better error handling
      try {
        const pointsResponse = await fetch('/api/points', {
          credentials: 'include',
          cache: 'no-cache'
        })
        
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json()
          if (pointsData.success && pointsData.summary) {
            setStats({
              currentPoints: pointsData.summary.currentPoints,
              totalEarned: pointsData.summary.totalEarned,
              totalSpent: pointsData.summary.totalSpent,
              totalDownloads: 0, // Mock for now
              monthlyDownloads: 0, // Mock for now
              accountStatus: 'Active'
            })
            
            // Convert points history to recent activity
            const activities: RecentActivity[] = pointsData.history.slice(0, 5).map((item: any) => ({
              id: item.id,
              type: item.type === 'EARNED' ? 'POINTS_EARNED' : 'DOWNLOAD',
              description: item.description || `${item.type.toLowerCase()} points`,
              amount: Math.abs(item.points),
              date: item.createdAt
            }))
            
            setRecentActivity(activities)
            console.log('✅ [Dashboard] Points data loaded')
          }
        } else {
          console.log('ℹ️ [Dashboard] Points API failed, using defaults')
          setStats({
            currentPoints: 100,
            totalEarned: 100,
            totalSpent: 0,
            totalDownloads: 0,
            monthlyDownloads: 0,
            accountStatus: 'Active'
          })
        }
      } catch (error) {
        console.log('ℹ️ [Dashboard] Points error (non-critical), using defaults')
        setStats({
          currentPoints: 100,
          totalEarned: 100,
          totalSpent: 0,
          totalDownloads: 0,
          monthlyDownloads: 0,
          accountStatus: 'Active'
        })
      }
      
    } catch (error) {
      console.error('❌ Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your Stock Media account today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <Coins className="h-4 w-4 mr-2" />
              Current Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats?.currentPoints || 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available for downloads</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Total Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.totalDownloads || 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lifetime downloads</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats?.monthlyDownloads || 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Downloads this month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                {stats?.accountStatus || 'Active'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
              <Search className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/browse">
              <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
                <Search className="h-4 w-4 mr-2" />
                Browse Stock Media
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            
            <Link href="/dashboard/downloads">
              <Button variant="outline" className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="h-4 w-4 mr-2" />
                View Downloads
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            
            <Link href="/dashboard/subscription">
              <Button variant="outline" className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.amount && (
                      <Badge variant={activity.type === 'POINTS_EARNED' ? 'default' : 'secondary'} className="dark:bg-gray-700">
                        {activity.type === 'POINTS_EARNED' ? '+' : '-'}{activity.amount}
                      </Badge>
                    )}
                  </div>
                ))}
                
                <Link href="/dashboard/points">
                  <Button variant="outline" size="sm" className="w-full border-gray-200 dark:border-gray-700">
                    View All Activity
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start downloading to see activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Stock Sites */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <Star className="h-5 w-5" />
            <span>Popular Stock Sites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Shutterstock', cost: '1-5 points', popular: true },
              { name: 'Adobe Stock', cost: '1-8 points', popular: true },
              { name: 'Freepik', cost: '0.15 points', popular: false },
              { name: 'Unsplash', cost: '0.1 points', popular: false },
              { name: 'iStock', cost: '2-16 points', popular: true },
              { name: 'Getty Images', cost: '16+ points', popular: false },
              { name: 'Flaticon', cost: '0.25 points', popular: false },
              { name: 'Vecteezy', cost: '0.3 points', popular: false }
            ].map((site) => (
              <div key={site.name} className="text-center p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 transition-colors bg-gray-50 dark:bg-gray-700/50">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{site.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{site.cost}</div>
                {site.popular && (
                  <Badge variant="secondary" className="mt-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs">
                    Popular
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/dashboard/browse">
              <Button className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
                Browse All Sites
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}