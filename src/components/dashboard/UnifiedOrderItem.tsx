'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { X, Download, AlertCircle, Loader2 } from 'lucide-react'

export interface UnifiedOrderItemData {
  url: string
  parsedData?: {
    source: string
    id: string
    url: string
  }
  stockSite?: {
    name: string
    displayName: string
    cost: number
  }
  stockInfo?: {
    id: string
    title: string
    image: string
    points: number
  }
  status: 'ready' | 'ordering' | 'processing' | 'completed' | 'failed'
  progress?: number
  downloadUrl?: string
  error?: string
  orderId?: string
}

interface UnifiedOrderItemProps {
  item: UnifiedOrderItemData
  onOrder: (item: UnifiedOrderItemData) => void
  onRemove: (url: string) => void
  userPoints: number
}

export const UnifiedOrderItem: React.FC<UnifiedOrderItemProps> = ({ 
  item, 
  onOrder, 
  onRemove, 
  userPoints 
}) => {
  const { url, parsedData, stockSite, stockInfo, status, progress, downloadUrl, error } = item

  const canAfford = userPoints >= (stockInfo?.points || 0)
  const isOrdered = status !== 'ready' && status !== 'failed'

  const renderStatus = () => {
    switch (status) {
      case 'ordering':
        return (
          <Button className="w-full" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Ordering...
          </Button>
        )
      
      case 'processing':
        return (
          <div className="w-full text-center">
            <Progress value={progress || 0} className="h-2 mb-2" />
            <span className="text-xs text-muted-foreground">Processing...</span>
          </div>
        )
      
      case 'completed':
        return (
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        )
      
      case 'failed':
        return (
          <div className="text-center">
            <Badge variant="destructive" className="mb-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Failed
            </Badge>
            <p className="text-xs text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => onOrder(item)}>
              Retry
            </Button>
          </div>
        )
      
      default: // 'ready' state
        return (
          <Button 
            className="w-full" 
            onClick={() => onOrder(item)}
            disabled={!canAfford}
          >
            Order for {stockInfo?.points || 0} Points
          </Button>
        )
    }
  }

  if (!stockInfo) {
    return (
      <Card className="overflow-hidden border-red-200">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-20 h-20 bg-red-100 rounded-md flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="flex-grow">
            <p className="font-semibold text-sm text-red-600">Failed to Parse</p>
            <p className="text-xs text-muted-foreground truncate">{url}</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onRemove(url)}>
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      status === 'processing' ? 'border-blue-200 bg-blue-50' : 
      status === 'completed' ? 'border-green-200 bg-green-50' :
      status === 'failed' ? 'border-red-200 bg-red-50' : ''
    }`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={stockInfo.image}
            alt={stockInfo.title}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{stockInfo.title}</p>
          <p className="text-xs text-muted-foreground">{stockSite?.displayName || 'Unknown Source'}</p>
          {!canAfford && status === 'ready' && (
            <p className="text-xs text-red-500 mt-1">Insufficient points</p>
          )}
        </div>
        
        <div className="w-40 flex-shrink-0">
          {renderStatus()}
        </div>
        
        {status === 'ready' && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex-shrink-0" 
            onClick={() => onRemove(url)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default UnifiedOrderItem
