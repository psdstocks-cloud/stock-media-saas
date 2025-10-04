'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { ThemedIcon } from './ThemedIcon'

interface KPIData {
  totalRevenue: number
  totalUsers: number
  totalOrders: number
  conversionRate: number
  revenueGrowth: number
  userGrowth: number
  orderGrowth: number
  conversionGrowth: number
}

interface KPICardsProps {
  className?: string
}

interface KPIItem {
  title: string
  value: string
  growth: number
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
}

export function KPICards({ className }: KPICardsProps) {
  const [data, setData] = useState<KPIData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchKPIData = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1)
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/analytics/kpis', {
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
          throw new Error('Insufficient permissions to view KPI data.')
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`Failed to fetch KPI data (${response.status})`)
        }
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch KPI data')
      }

      setData(result.data || null)
      setError(null)
      
      if (isRetry) {
        toast.success('KPI data refreshed successfully!')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Error fetching KPI data:', err)
      
      if (!isRetry) {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKPIData()
  }, [fetchKPIData])

  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  const formatPercentage = useCallback((value: number): string => {
    return `${Math.abs(value).toFixed(1)}%`
  }, [])

  const getGrowthIcon = useCallback((growth: number) => {
    if (growth >= 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />
    }
  }, [])

  const getGrowthColor = useCallback((growth: number): string => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500'
  }, [])

  const kpiItems: KPIItem[] = React.useMemo(() => {
    if (!data) {
      return [
        {
          title: 'Total Revenue',
          value: '$0',
          growth: 0,
          icon: DollarSign,
          description: 'Total revenue generated',
          color: 'text-green-600'
        },
        {
          title: 'Total Users',
          value: '0',
          growth: 0,
          icon: Users,
          description: 'Registered users',
          color: 'text-blue-600'
        },
        {
          title: 'Total Orders',
          value: '0',
          growth: 0,
          icon: ShoppingCart,
          description: 'Orders processed',
          color: 'text-purple-600'
        },
        {
          title: 'Conversion Rate',
          value: '0%',
          growth: 0,
          icon: TrendingUp,
          description: 'User conversion rate',
          color: 'text-orange-600'
        }
      ]
    }

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(data.totalRevenue),
        growth: data.revenueGrowth,
        icon: DollarSign,
        description: 'Total revenue generated',
        color: 'text-green-600'
      },
      {
        title: 'Total Users',
        value: data.totalUsers.toLocaleString(),
        growth: data.userGrowth,
        icon: Users,
        description: 'Registered users',
        color: 'text-blue-600'
      },
      {
        title: 'Total Orders',
        value: data.totalOrders.toLocaleString(),
        growth: data.orderGrowth,
        icon: ShoppingCart,
        description: 'Orders processed',
        color: 'text-purple-600'
      },
      {
        title: 'Conversion Rate',
        value: formatPercentage(data.conversionRate),
        growth: data.conversionGrowth,
        icon: TrendingUp,
        description: 'User conversion rate',
        color: 'text-orange-600'
      }
    ]
  }, [data, formatCurrency, formatPercentage])

  const handleRetry = useCallback(() => {
    fetchKPIData(true)
  }, [fetchKPIData])

  if (error) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        <div className="col-span-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
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
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {kpiItems.map((item, index) => (
        <Card 
          key={index} 
          className="relative overflow-hidden transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: 'var(--admin-bg-card)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle 
              className="text-sm font-medium"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              {item.title}
            </CardTitle>
            <ThemedIcon 
              icon={item.icon}
              className="h-4 w-4"
              style={{ color: 'var(--admin-accent)' }}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-16" />
                </>
              ) : (
                <>
                  <Typography 
                    variant="h3" 
                    className="font-bold"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    {item.value}
                  </Typography>
                  <div className="flex items-center space-x-1">
                    {getGrowthIcon(item.growth)}
                    <Typography 
                      variant="caption" 
                      className={`font-medium ${getGrowthColor(item.growth)}`}
                    >
                      {formatPercentage(item.growth)} from last month
                    </Typography>
                  </div>
                </>
              )}
            </div>
            <Typography 
              variant="caption" 
              className="block mt-2"
              style={{ color: 'var(--admin-text-muted)' }}
            >
              {item.description}
            </Typography>
          </CardContent>
          
          {/* Decorative gradient */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-16 translate-x-16"
            style={{ backgroundColor: 'var(--admin-accent)' }}
          ></div>
        </Card>
      ))}
    </div>
  )
}

export default KPICards