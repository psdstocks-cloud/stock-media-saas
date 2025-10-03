'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

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

interface StatusConfig {
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string
}

export function RecentOrdersList({ className, limit = 5 }: RecentOrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchRecentOrders = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1)
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/orders?limit=${limit}&sort=createdAt&order=desc`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('Insufficient permissions to view orders.')
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`Failed to fetch recent orders (${response.status})`)
        }
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch recent orders')
      }

      setOrders(result.orders || [])
      setError(null)
      
      if (isRetry) {
        toast.success('Recent orders refreshed successfully!')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Error fetching recent orders:', err)
      
      if (!isRetry) {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchRecentOrders()
  }, [fetchRecentOrders])

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const formatPoints = useCallback((points: number): string => {
    return points.toLocaleString() + ' pts'
  }, [])

  const getStatusConfig = useCallback((status: string): StatusConfig => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'Completed',
          icon: CheckCircle,
          className: 'bg-green-500 text-white'
        }
      case 'PROCESSING':
        return {
          label: 'Processing',
          icon: Clock,
          className: 'bg-yellow-500 text-white'
        }
      case 'PENDING':
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-blue-500 text-white'
        }
      case 'FAILED':
        return {
          label: 'Failed',
          icon: XCircle,
          className: 'bg-red-500 text-white'
        }
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          icon: XCircle,
          className: 'bg-gray-500 text-white'
        }
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-gray-500 text-white'
        }
    }
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    const config = getStatusConfig(status)
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }, [getStatusConfig])

  const handleRetry = useCallback(() => {
    fetchRecentOrders(true)
  }, [fetchRecentOrders])

  const orderItems = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      formattedDate: formatDate(order.createdAt),
      formattedPoints: formatPoints(order.cost),
      statusConfig: getStatusConfig(order.status)
    }))
  }, [orders, formatDate, formatPoints, getStatusConfig])

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Latest {limit} orders from the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                disabled={isLoading}
                className="ml-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Retry {retryCount > 0 && `(${retryCount})`}
              </Button>
            </AlertDescription>
          </Alert>
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
              onClick={handleRetry}
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
            {orderItems.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
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
                      {order.userName || order.userEmail} • {order.formattedPoints}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {order.formattedDate}
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