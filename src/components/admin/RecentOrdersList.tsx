'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ShoppingCart, 
  RefreshCw, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface Order {
  id: string
  userId: string
  userEmail: string
  userName: string | null
  status: string
  cost: number
  assetUrl: string | null
  assetTitle: string | null
  createdAt: string
  updatedAt: string
}

interface RecentOrdersListProps {
  className?: string
  limit?: number
}

export function RecentOrdersList({ className, limit = 5 }: RecentOrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRecentOrders = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/orders?limit=${limit}&sort=createdAt&order=desc`)
      if (response.ok) {
        const result = await response.json()
        setOrders(result.orders || [])
      } else {
        setError('Failed to fetch recent orders')
      }
    } catch (error) {
      setError('An error occurred while fetching recent orders')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentOrders()
  }, [limit])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'PROCESSING':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
      case 'PENDING':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />{status}</Badge>
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Latest orders from the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={fetchRecentOrders}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest {limit} orders from the platform
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecentOrders}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <Typography variant="h3" className="mb-2">
              No Recent Orders
            </Typography>
            <Typography variant="body" color="muted">
              Orders will appear here once they are placed
            </Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Typography variant="body" className="font-medium truncate">
                        {order.assetTitle || 'Unknown Asset'}
                      </Typography>
                      <Typography variant="caption" color="muted" className="font-mono">
                        #{order.id.slice(0, 8)}
                      </Typography>
                    </div>
                    <Typography variant="caption" color="muted" className="block">
                      {order.userName || order.userEmail} • {order.cost} pts
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full">
                View All Orders
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentOrdersList
