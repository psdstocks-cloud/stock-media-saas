'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Download, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Zap,
  Star,
  Plus,
  Eye,
  Filter
} from 'lucide-react'

interface DashboardData {
  balance: any
  history: any[]
  orders: any[]
  stockSites: any[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const [balance, history, orders, stockSites] = await Promise.all([
          fetch(`/api/points?userId=${session.user.id}`).then(res => res.json()).then(data => data.balance),
          fetch(`/api/points?userId=${session.user.id}`).then(res => res.json()).then(data => data.history),
          fetch(`/api/orders?userId=${session.user.id}`).then(res => res.json()).then(data => data.orders),
          fetch('/api/stock-sites').then(res => res.json()).then(data => data.stockSites || [])
        ])

        setData({ balance, history, orders, stockSites })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id || !data) {
    return null
  }

  const { balance, history, orders, stockSites } = data
  const recentOrders = orders?.slice(0, 5) || []
  const recentHistory = history?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/browse">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Media
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {session.user.name || session.user.email}!
          </h2>
          <p className="text-slate-600">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Available Points</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {balance?.currentPoints || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Downloads This Month</p>
                  <p className="text-3xl font-bold text-green-900">
                    {orders?.filter((order: any) => order.status === 'COMPLETED').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {orders?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Active Sites</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {stockSites?.filter((site: any) => site.isActive).length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/browse" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Media
                  </Button>
                </Link>
                <Link href="/dashboard/orders" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
                <Link href="/dashboard/profile" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Manage Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Available Sites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Available Sites
                </CardTitle>
                <CardDescription>
                  {stockSites?.length || 0} stock sites ready for downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockSites?.slice(0, 5).map((site: any) => (
                    <div key={site.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{site.displayName}</p>
                        <p className="text-sm text-slate-600">{site.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{site.cost} pts</p>
                        <Badge variant={site.isActive ? "success" : "secondary"} className="text-xs">
                          {site.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/browse" className="block mt-4">
                  <Button variant="ghost" className="w-full">
                    View All Sites
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      Recent Orders
                    </div>
                    <Link href="/dashboard/orders">
                      <Button variant="ghost" size="sm">
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Download className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No orders yet</p>
                      <Link href="/dashboard/browse">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Start Browsing
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              order.status === 'COMPLETED' ? 'bg-green-500' :
                              order.status === 'PROCESSING' ? 'bg-yellow-500' :
                              order.status === 'FAILED' ? 'bg-red-500' :
                              'bg-slate-400'
                            }`} />
                            <div>
                              <p className="font-medium text-slate-900">{order.title}</p>
                              <p className="text-sm text-slate-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              order.status === 'COMPLETED' ? 'success' :
                              order.status === 'PROCESSING' ? 'warning' :
                              order.status === 'FAILED' ? 'error' :
                              'secondary'
                            }>
                              {order.status}
                            </Badge>
                            <p className="text-sm text-slate-600 mt-1">{order.cost} points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentHistory.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'SUBSCRIPTION' ? 'bg-blue-100' :
                            activity.type === 'DOWNLOAD' ? 'bg-green-100' :
                            activity.type === 'REFUND' ? 'bg-orange-100' :
                            'bg-slate-100'
                          }`}>
                            {activity.type === 'SUBSCRIPTION' ? (
                              <Plus className="w-4 h-4 text-blue-600" />
                            ) : activity.type === 'DOWNLOAD' ? (
                              <Download className="w-4 h-4 text-green-600" />
                            ) : activity.type === 'REFUND' ? (
                              <ArrowRight className="w-4 h-4 text-orange-600" />
                            ) : (
                              <Star className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{activity.description}</p>
                            <p className="text-sm text-slate-600">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {activity.amount > 0 ? '+' : ''}{activity.amount} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}