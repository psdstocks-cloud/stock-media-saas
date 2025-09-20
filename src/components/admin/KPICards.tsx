'use client'

import React, { useState, useEffect } from 'react'
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
  ArrowDownRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export function KPICards({ className }: KPICardsProps) {
  const [data, setData] = useState<KPIData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchKPIData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/analytics/kpis')
      if (response.ok) {
        const result = await response.json()
        setData(result.data || null)
      } else {
        setError('Failed to fetch KPI data')
      }
    } catch (error) {
      setError('An error occurred while fetching KPI data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchKPIData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getGrowthIcon = (growth: number) => {
    if (growth >= 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />
    }
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const kpiItems = [
    {
      title: 'Total Revenue',
      value: data?.totalRevenue ? formatCurrency(data.totalRevenue) : '0',
      growth: data?.revenueGrowth || 0,
      icon: DollarSign,
      description: 'Total revenue generated',
      color: 'text-green-600'
    },
    {
      title: 'Total Users',
      value: data?.totalUsers ? data.totalUsers.toLocaleString() : '0',
      growth: data?.userGrowth || 0,
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders ? data.totalOrders.toLocaleString() : '0',
      growth: data?.orderGrowth || 0,
      icon: ShoppingCart,
      description: 'Orders processed',
      color: 'text-purple-600'
    },
    {
      title: 'Conversion Rate',
      value: data?.conversionRate ? formatPercentage(data.conversionRate) : '0%',
      growth: data?.conversionGrowth || 0,
      icon: TrendingUp,
      description: 'User conversion rate',
      color: 'text-orange-600'
    }
  ]

  if (error) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        <div className="col-span-full">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={fetchKPIData}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {kpiItems.map((item, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
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
                  <Typography variant="h3" className="font-bold">
                    {item.value}
                  </Typography>
                  <div className="flex items-center space-x-1">
                    {getGrowthIcon(item.growth)}
                    <Typography 
                      variant="caption" 
                      className={`font-medium ${getGrowthColor(item.growth)}`}
                    >
                      {Math.abs(item.growth).toFixed(1)}% from last month
                    </Typography>
                  </div>
                </>
              )}
            </div>
            <Typography variant="caption" color="muted" className="block mt-2">
              {item.description}
            </Typography>
          </CardContent>
          
          {/* Decorative gradient */}
          <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 ${item.color.replace('text-', 'bg-')} rounded-full -translate-y-16 translate-x-16`}></div>
        </Card>
      ))}
    </div>
  )
}

export default KPICards
