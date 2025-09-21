'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

interface OrderProgress {
  id: string
  status: string
  title: string
  source: string
  assetId: string
  downloadUrl?: string
  estimatedTime?: string
  isProcessing: boolean
  canDownload: boolean
  createdAt: string
  updatedAt: string
  error?: string
}

interface OrderProgressTrackerProps {
  orderId: string
  onComplete?: () => void
  onError?: (error: string) => void
}

export default function OrderProgressTracker({ 
  orderId, 
  onComplete, 
  onError 
}: OrderProgressTrackerProps) {
  const [order, setOrder] = useState<OrderProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 10 // Stop polling after 10 attempts (about 2 minutes)

  const fetchOrderStatus = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsRefreshing(true)
      }

      const response = await fetch(`/api/orders/${orderId}/status`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch order status')
      }

      const data = await response.json()
      
      if (data.success && data.order) {
        setOrder(data.order)
        
        // Stop polling if order is completed or failed
        if (data.order.status === 'COMPLETED') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          onComplete?.()
          toast.success('Order completed successfully!')
        } else if (data.order.status === 'FAILED') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          onError?.(data.order.error || 'Order processing failed')
          toast.error(data.order.error || 'Order processing failed')
        }
      }
    } catch (error) {
      console.error('Failed to fetch order status:', error)
      
      // Increment retry count
      setRetryCount(prev => {
        const newCount = prev + 1
        if (newCount >= maxRetries) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          onError?.('Failed to track order progress. Please check your orders page.')
        }
        return newCount
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Poll every 10 seconds
    intervalRef.current = setInterval(() => {
      fetchOrderStatus()
    }, 10000)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleRefresh = () => {
    fetchOrderStatus(true)
  }

  useEffect(() => {
    // Initial fetch
    fetchOrderStatus()
    
    // Start polling if order is processing
    if (order?.isProcessing) {
      startPolling()
    }

    // Cleanup on unmount
    return () => {
      stopPolling()
    }
  }, [])

  useEffect(() => {
    // Start/stop polling based on order status
    if (order?.isProcessing) {
      startPolling()
    } else {
      stopPolling()
    }
  }, [order?.status])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Order received and queued for processing'
      case 'PROCESSING':
        return 'Your order is being processed'
      case 'COMPLETED':
        return 'Order completed successfully!'
      case 'FAILED':
        return 'Order processing failed'
      default:
        return 'Unknown status'
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 animate-pulse" />
            Loading Order Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!order) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            Order Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              Unable to find order with ID: {orderId}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            {getStatusIcon(order.status)}
            <span className="ml-2">Order Progress</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {order.isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-white hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="space-y-2">
          <Typography variant="h4" className="text-white">
            {order.title}
          </Typography>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>Source: {order.source}</span>
            <span>ID: {order.assetId}</span>
          </div>
        </div>

        {/* Status Message */}
        <Alert className={
          order.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/20' :
          order.status === 'FAILED' ? 'bg-red-500/10 border-red-500/20' :
          'bg-blue-500/10 border-blue-500/20'
        }>
          {order.status === 'COMPLETED' ? (
            <CheckCircle className="h-4 w-4" />
          ) : order.status === 'FAILED' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          <AlertDescription className={
            order.status === 'COMPLETED' ? 'text-green-300' :
            order.status === 'FAILED' ? 'text-red-300' :
            'text-blue-300'
          }>
            {getStatusMessage(order.status)}
            {order.error && (
              <div className="mt-2 text-sm">
                Error: {order.error}
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Progress Indicators */}
        {order.isProcessing && (
          <div className="space-y-3">
            {order.estimatedTime && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock className="h-4 w-4" />
                <Typography variant="small" className="text-yellow-400">
                  Estimated time remaining: {order.estimatedTime}
                </Typography>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-blue-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <Typography variant="small" className="text-blue-400">
                Checking status every 10 seconds...
              </Typography>
            </div>
          </div>
        )}

        {/* Download Section */}
        {order.canDownload && order.downloadUrl && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <Typography variant="h5" className="text-white">
              Download Ready!
            </Typography>
            <div className="flex gap-3">
              <Button
                onClick={() => window.open(order.downloadUrl, '_blank')}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Now
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(order.downloadUrl, '_blank')}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        )}

        {/* Order Timestamps */}
        <div className="text-xs text-gray-400 space-y-1 pt-4 border-t border-white/10">
          <div>Created: {new Date(order.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(order.updatedAt).toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
