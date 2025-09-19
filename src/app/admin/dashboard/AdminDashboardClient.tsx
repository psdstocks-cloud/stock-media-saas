'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface AdminData {
  userCount: number
  orderCount: number
  totalRevenue: number
  recentOrders: Array<{
    id: string
    status: string
    cost: number
    createdAt: string
    user: {
      email: string
      name: string | null
    }
  }>
  userGrowth: number
}

interface AdminDashboardClientProps {
  initialData: AdminData
}

export default function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [data, setData] = useState<AdminData>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/analytics/overview')
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate sample revenue data for the chart
  const revenueData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000) + 500,
      orders: Math.floor(Math.random() * 50) + 20
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500'
      case 'PROCESSING': return 'bg-yellow-500'
      case 'PENDING': return 'bg-blue-500'
      case 'FAILED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">
            Admin Dashboard
          </Typography>
          <Typography variant="body" color="muted" className="mt-2">
            Overview of your Stock Media SaaS platform
          </Typography>
        </div>
        <Button
          onClick={refreshData}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userCount.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{data.userGrowth}</span>
              <span className="ml-1">from last 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.orderCount.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-blue-500">+12.5%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRevenue.toLocaleString()} pts</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+8.2%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(data.userCount * 0.15)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-green-500">15%</span>
              <span className="ml-1">of total users</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Daily revenue for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders vs Revenue</CardTitle>
            <CardDescription>Daily orders and revenue comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#8b5cf6" />
                <Bar dataKey="revenue" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
                  <div>
                    <Typography variant="body" className="font-medium">
                      {order.user.name || order.user.email}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">
                    {order.cost} pts
                  </Badge>
                  <Badge 
                    variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}
                    className={order.status === 'COMPLETED' ? 'bg-green-500' : ''}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
            {data.recentOrders.length === 0 && (
              <div className="text-center py-8">
                <Typography variant="body" color="muted">
                  No recent orders found
                </Typography>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
