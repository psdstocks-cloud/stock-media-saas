'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { 
  CheckCircle, 
  Loader2, 
  Download, 
  X, 
  AlertCircle,
  FileImage,
  Film,
  Music,
  Palette
} from 'lucide-react'

export interface OrderItemData {
  url: string
  parsedData: {
    source: string
    id: string
    url: string
  } | null
  stockSite: {
    name: string
    displayName: string
    cost: number
  } | null
  stockInfo: {
    id: string
    source: string
    title: string
    image: string
    points: number
    price: number
    type?: string
  } | null
  success: boolean
  error?: string
}

export interface OrderStatus {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'FAILED'
  downloadUrl?: string
  error?: string
}

interface UnifiedOrderItemProps {
  item: OrderItemData
  orderStatus?: OrderStatus
  userPoints: number
  isProcessing: boolean
  onOrder: (item: OrderItemData) => void
  onRemove: (item: OrderItemData) => void
  onRetry?: (item: OrderItemData) => void
}

const getTypeIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'video':
      return <Film className="h-5 w-5 text-blue-400" />
    case 'audio':
      return <Music className="h-5 w-5 text-green-400" />
    case 'vector':
      return <Palette className="h-5 w-5 text-purple-400" />
    default:
      return <FileImage className="h-5 w-5 text-gray-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'PROCESSING':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    case 'PENDING':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'FAILED':
      return 'bg-red-500/20 text-red-300 border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

export default function UnifiedOrderItem({
  item,
  orderStatus,
  userPoints,
  isProcessing,
  onOrder,
  onRemove,
  onRetry
}: UnifiedOrderItemProps) {
  const [isLocalProcessing, setIsLocalProcessing] = useState(false)
  
  if (!item.success || !item.stockInfo) {
    // Failed item state
    return (
      <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-lg border border-red-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <Typography variant="body" className="text-white font-medium truncate">
              Failed to process URL
            </Typography>
            <Typography variant="caption" className="text-red-300">
              {item.error || 'Unknown error'}
            </Typography>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(item)}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const handleOrder = async () => {
    setIsLocalProcessing(true)
    try {
      await onOrder(item)
    } finally {
      setIsLocalProcessing(false)
    }
  }

  const points = item.stockInfo.points || 10
  const canAfford = userPoints >= points
  const isOrdered = !!orderStatus
  const currentStatus = orderStatus?.status

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
      isOrdered 
        ? 'bg-white/5 border-white/10' 
        : 'bg-white/10 border-white/20 hover:bg-white/15'
    }`}>
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          {item.stockInfo.image ? (
            <img 
              src={item.stockInfo.image} 
              alt={item.stockInfo.title}
              className="w-full h-full object-cover"
            />
          ) : (
            getTypeIcon(item.stockInfo.type)
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <Typography variant="body" className="text-white font-medium truncate">
            {item.stockInfo.title}
          </Typography>
          <Typography variant="caption" className="text-white/60">
            {item.stockSite?.displayName || item.parsedData?.source || 'Unknown Source'}
          </Typography>
          
          {/* Status indicator for ordered items */}
          {isOrdered && currentStatus && (
            <div className="mt-2">
              <Badge className={getStatusColor(currentStatus)}>
                {currentStatus === 'PROCESSING' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                {currentStatus}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {!isOrdered && (
          <>
            {/* Points badge */}
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {points} points
            </Badge>
            
            {/* Remove button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(item)}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Order button */}
            <Button
              size="sm"
              onClick={handleOrder}
              disabled={isProcessing || isLocalProcessing || !canAfford}
              className={`min-w-[120px] ${
                canAfford 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isProcessing || isLocalProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ordering...
                </>
              ) : !canAfford ? (
                'Insufficient Points'
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Order ({points} pts)
                </>
              )}
            </Button>
          </>
        )}
        
        {isOrdered && (
          <div className="flex items-center space-x-2">
            {currentStatus === 'COMPLETED' && orderStatus?.downloadUrl && (
              <Button
                size="sm"
                onClick={() => window.open(orderStatus.downloadUrl, '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            
            {currentStatus === 'FAILED' && onRetry && (
              <Button
                size="sm"
                onClick={() => onRetry(item)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            
            {currentStatus === 'PENDING' && (
              <div className="flex items-center space-x-2 text-blue-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
