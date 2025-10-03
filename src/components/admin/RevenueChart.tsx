'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  RefreshCw,
  AlertCircle,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface RevenueData {
  date: string
  revenue: number
  orders: number
}

interface RevenueChartProps {
  className?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

export function RevenueChart({ className }: RevenueChartProps) {
  const [data, setData] = useState<RevenueData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [retryCount, setRetryCount] = useState(0)

  const fetchRevenueData = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1)
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/analytics/revenue-chart', {
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
          throw new Error('Insufficient permissions to view revenue data.')
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`Failed to fetch revenue data (${response.status})`)
        }
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch revenue data')
      }

      setData(result.data || [])
      setError(null)
      
      if (isRetry) {
        toast.success('Revenue data refreshed successfully!')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Error fetching revenue data:', err)
      
      if (!isRetry) {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRevenueData()
  }, [fetchRevenueData])

  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const calculateTotalRevenue = useCallback((): number => {
    return data.reduce((sum, item) => sum + item.revenue, 0)
  }, [data])

  const calculateGrowth = useCallback((): number => {
    if (data.length < 2) return 0
    const firstWeek = data.slice(0, 7).reduce((sum, item) => sum + item.revenue, 0)
    const lastWeek = data.slice(-7).reduce((sum, item) => sum + item.revenue, 0)
    return firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0
  }, [data])

  const CustomTooltip = useCallback(({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <Typography variant="body" className="font-medium mb-2">
            {formatDate(label || '')}
          </Typography>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <Typography variant="caption">
                Revenue: {formatCurrency(payload[0].value)}
              </Typography>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <Typography variant="caption">
                Orders: {payload[0].payload.orders}
              </Typography>
            </div>
          </div>
        </div>
      )
    }
    return null
  }, [formatCurrency, formatDate])

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: formatDate(item.date)
    }))
  }, [data, formatDate])

  const handleRetry = useCallback(() => {
    fetchRevenueData(true)
  }, [fetchRevenueData])

  const handleChartTypeChange = useCallback((type: 'line' | 'bar') => {
    setChartType(type)
  }, [])

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>
            Revenue trends over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <DollarSign className="h-5 w-5 mr-2" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              Revenue trends over the last 30 days
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartTypeChange('line')}
            >
              <LineChartIcon className="h-4 w-4 mr-1" />
              Line
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartTypeChange('bar')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Bar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <Typography variant="caption" color="muted">
              Total Revenue (30 days)
            </Typography>
            <Typography variant="h3" className="font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                formatCurrency(calculateTotalRevenue())
              )}
            </Typography>
          </div>
          <div className="space-y-1">
            <Typography variant="caption" color="muted">
              Growth Rate
            </Typography>
            <div className="flex items-center space-x-1">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  {calculateGrowth() >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <Typography 
                    variant="h3" 
                    className={`font-bold ${
                      calculateGrowth() >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {Math.abs(calculateGrowth()).toFixed(1)}%
                  </Typography>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <Typography variant="h3" className="mb-2">
              No Revenue Data
            </Typography>
            <Typography variant="body" color="muted">
              Revenue data will appear here once orders are processed
            </Typography>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="formattedDate" 
                    className="text-xs"
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    className="text-xs"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="formattedDate" 
                    className="text-xs"
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    className="text-xs"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RevenueChart