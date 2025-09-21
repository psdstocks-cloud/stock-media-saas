'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Loader2,
  RefreshCw,
  Eye,
  FileText
} from 'lucide-react'
import { useOrderStore, ConfirmedOrder } from '@/stores/orderStore'
import { toast } from 'react-hot-toast'

interface OrderProgressProps {
  onBack: () => void
}

export default function OrderProgress({ onBack }: OrderProgressProps) {
  const { 
    confirmedOrders, 
    isTrackingProgress,
    getPendingOrders,
    getCompletedOrders,
    getFailedOrders,
    pollAllOrders,
    stopProgressTracking
  } = useOrderStore()

  const [isPolling, setIsPolling] = useState(false)

  const pendingOrders = getPendingOrders()
  const completedOrders = getCompletedOrders()
  const failedOrders = getFailedOrders()

  // Enhanced polling with better error handling
  useEffect(() => {
    if (!isTrackingProgress || pendingOrders.length === 0) {
      return
    }

    const pollInterval = setInterval(async () => {
      setIsPolling(true)
      
      try {
        await pollAllOrders()
        
        // Check if all orders are completed
        const stillPending = getPendingOrders()
        if (stillPending.length === 0) {
          stopProgressTracking()
          toast.success('🎉 All orders completed!', {
            duration: 4000,
            icon: '✅'
          })
        }
        
      } catch (error) {
        console.error('Error polling orders:', error)
        toast.error('Failed to check order status', {
          duration: 3000,
          icon: '⚠️'
        })
      } finally {
        setIsPolling(false)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [isTrackingProgress, pendingOrders, pollAllOrders, stopProgressTracking, getPendingOrders])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
      case 'PROCESSING':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Processing</Badge>
      case 'READY':
        return <Badge variant="success" className="bg-green-100 text-green-800">Ready</Badge>
      case 'COMPLETED':
        return <Badge variant="success" className="bg-green-100 text-green-800">Completed</Badge>
      case 'FAILED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'READY':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const handleDownload = (order: ConfirmedOrder) => {
    if (order.downloadUrl) {
      window.open(order.downloadUrl, '_blank')
    } else {
      toast.error('Download link not available yet')
    }
  }

  const handleRefresh = () => {
    // Force refresh all pending orders using store method
    pollAllOrders()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getEstimatedTime = (order: ConfirmedOrder) => {
    if (order.estimatedTime) {
      return order.estimatedTime
    }
    
    // Calculate estimated time based on order age
    const orderTime = new Date(order.createdAt)
    const now = new Date()
    const ageMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))
    
    if (ageMinutes < 1) return 'Just now'
    if (ageMinutes < 60) return `${ageMinutes}m ago`
    const hours = Math.floor(ageMinutes / 60)
    return `${hours}h ${ageMinutes % 60}m ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Typography variant="h3" className="text-white mb-2">
          Order Progress
        </Typography>
        <Typography variant="body" className="text-white/80">
          Track your orders in real-time
        </Typography>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Typography variant="h4" className="text-white font-bold">
              {confirmedOrders.length}
            </Typography>
            <Typography variant="caption" className="text-white/70">
              Total Orders
            </Typography>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Typography variant="h4" className="text-yellow-400 font-bold">
              {pendingOrders.length}
            </Typography>
            <Typography variant="caption" className="text-white/70">
              Pending
            </Typography>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Typography variant="h4" className="text-green-400 font-bold">
              {completedOrders.length}
            </Typography>
            <Typography variant="caption" className="text-white/70">
              Completed
            </Typography>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Typography variant="h4" className="text-red-400 font-bold">
              {failedOrders.length}
            </Typography>
            <Typography variant="caption" className="text-white/70">
              Failed
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isTrackingProgress && (
            <div className="flex items-center gap-2 text-white/80">
              <Loader2 className="h-4 w-4 animate-spin" />
              <Typography variant="caption">
                Auto-refreshing every 3 seconds
              </Typography>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPolling}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isPolling ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            onClick={onBack}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Back to Order
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {confirmedOrders.map((order) => (
          <Card key={order.id} className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={order.thumbnailUrl}
                    alt={order.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Typography variant="h5" className="text-white truncate">
                        {order.title}
                      </Typography>
                      <Typography variant="caption" className="text-white/60">
                        {order.source} • {order.type}
                      </Typography>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                        <Typography variant="caption" className="text-white/60">
                          {getEstimatedTime(order)}
                        </Typography>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(order.status === 'READY' || order.status === 'COMPLETED') && order.downloadUrl ? (
                        <Button
                          size="sm"
                          onClick={() => handleDownload(order)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      ) : order.status === 'FAILED' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="border-red-500/50 text-red-400"
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Failed
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="border-white/20 text-white/60"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          {order.status === 'PROCESSING' ? 'Processing...' : 'Pending'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {order.status === 'FAILED' && order.error && (
                    <Alert className="mt-2 border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200 text-sm">
                        {order.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Order Details */}
                  <div className="flex items-center justify-between mt-2 text-sm text-white/60">
                    <span>Order ID: {order.id.slice(0, 8)}...</span>
                    <span>Created: {formatTime(order.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {confirmedOrders.length === 0 && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <Typography variant="h5" className="text-white mb-2">
              No Orders Yet
            </Typography>
            <Typography variant="body" className="text-white/60">
              Place your first order to see it tracked here
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="text-center">
        <Typography variant="caption" className="text-white/60">
          Orders are processed automatically. You'll receive notifications when they're ready for download.
        </Typography>
      </div>
    </div>
  )
}
