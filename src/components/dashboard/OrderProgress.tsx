'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { 
  CheckCircle, 
  X, 
  Clock, 
  Loader2, 
  Download,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface OrderProgressProps {
  order: {
    id: string
    title: string
    source: string
    status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'FAILED'
    downloadUrl?: string
    estimatedTime?: string
    points: number
    isProcessing?: boolean
    canDownload?: boolean
    createdAt?: string
    updatedAt?: string
    error?: string
  }
  onStatusUpdate?: (orderId: string, status: string, downloadUrl?: string, error?: string) => void
}

const OrderProgress: React.FC<OrderProgressProps> = ({ order, onStatusUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status)
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    // Start polling if order is not completed/failed
    if (order.status === 'PENDING' || order.status === 'PROCESSING') {
      setIsPolling(true)
      
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/orders/${order.id}/status`)
          const data = await response.json()

          if (data.success && data.order) {
            const { status, downloadUrl, error, isProcessing: _isProcessing, canDownload: _canDownload, estimatedTime: _estimatedTime } = data.order
            
            // Update local state
            setCurrentStatus(status)
            
            // Notify parent component
            if (onStatusUpdate) {
              onStatusUpdate(order.id, status, downloadUrl, error)
            }

            // Show notifications for status changes
            if (status !== order.status) {
              if (status === 'READY' || status === 'COMPLETED') {
                toast.success(`${order.title} is ready for download!`, {
                  duration: 5000,
                  icon: '🎉'
                })
              } else if (status === 'FAILED') {
                toast.error(`${order.title} failed to process`, {
                  duration: 5000,
                  icon: '❌'
                })
              }
            }

            // Stop polling if completed or failed
            if (status === 'COMPLETED' || status === 'FAILED') {
              setIsPolling(false)
              if (interval) {
                clearInterval(interval)
              }
            }
          }
        } catch (error) {
          console.error(`Failed to poll order ${order.id}:`, error)
        }
      }, 3000) // Poll every 3 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [order.id, order.status, order.title, onStatusUpdate])

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full"
    
    switch (status) {
      case 'PENDING':
        return (
          <Badge className={`${baseClasses} bg-yellow-500/20 text-yellow-300 border-yellow-500/30`}>
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'PROCESSING':
        return (
          <Badge className={`${baseClasses} bg-blue-500/20 text-blue-300 border-blue-500/30`}>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case 'READY':
      case 'COMPLETED':
        return (
          <Badge className={`${baseClasses} bg-green-500/20 text-green-300 border-green-500/30`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge className={`${baseClasses} bg-red-500/20 text-red-300 border-red-500/30`}>
            <X className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-500/20 text-gray-300 border-gray-500/30`}>
            {status}
          </Badge>
        )
    }
  }

  const handleDownload = () => {
    if (order.downloadUrl) {
      window.open(order.downloadUrl, '_blank')
    }
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-white/60" />
      </div>
      
      <div className="flex-1 min-w-0">
        <Typography variant="body" className="text-white font-medium truncate">
          {order.title}
        </Typography>
        <Typography variant="caption" className="text-white/60">
          {order.source} • {order.points} points
        </Typography>
        {order.error && (
          <div className="flex items-center space-x-1 mt-1">
            <AlertCircle className="h-3 w-3 text-red-400" />
            <Typography variant="caption" className="text-red-400">
              {order.error}
            </Typography>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {getStatusBadge(currentStatus)}
        
        {/* Real-time progress indicator */}
        {isPolling && (
          <div className="flex items-center space-x-2 text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {order.estimatedTime && `~${order.estimatedTime}`}
            </span>
          </div>
        )}
        
        {/* Download button when ready */}
        {(currentStatus === 'READY' || currentStatus === 'COMPLETED') && order.downloadUrl && (
          <Button
            size="sm"
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        )}
        
        {/* Completed indicator without download */}
        {currentStatus === 'COMPLETED' && !order.downloadUrl && (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Processing complete</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderProgress