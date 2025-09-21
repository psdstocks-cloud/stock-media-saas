'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Coins, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  X,
  FileImage,
  FileVideo,
  FileMusic,
  FileText
} from 'lucide-react'
import { PreOrderItem } from '@/stores/orderStore'

interface ConfirmationItemProps {
  item: PreOrderItem
  index: number
  onRemove: (index: number) => void
}

export default function ConfirmationItem({ item, index, onRemove }: ConfirmationItemProps) {
  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'photo':
      case 'image':
        return <FileImage className="h-4 w-4 text-blue-500" />
      case 'video':
        return <FileVideo className="h-4 w-4 text-red-500" />
      case 'audio':
      case 'music':
        return <FileMusic className="h-4 w-4 text-green-500" />
      case 'vector':
      case 'illustration':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <FileImage className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    if (item.success) {
      return <Badge variant="success" className="bg-green-100 text-green-800">Ready</Badge>
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Failed</Badge>
    }
  }

  const getStatusIcon = () => {
    if (item.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else {
      return <X className="h-4 w-4 text-red-600" />
    }
  }

  const handleRemove = () => {
    onRemove(index)
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {item.success && item.stockInfo ? (
              <div className="relative">
                <img
                  src={item.stockInfo.thumbnailUrl}
                  alt={item.stockInfo.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="absolute -top-1 -right-1">
                  {getTypeIcon(item.stockInfo.type)}
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-white/50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <Typography variant="h5" className="text-white truncate mb-1">
                  {item.success && item.stockInfo ? item.stockInfo.title : 'Unknown Title'}
                </Typography>

                {/* Source and Type */}
                <div className="flex items-center gap-2 mb-2">
                  <Typography variant="caption" className="text-white/60">
                    {item.success && item.parsedData ? item.parsedData.source : 'Unknown Source'}
                  </Typography>
                  {item.success && item.stockInfo && (
                    <>
                      <span className="text-white/40">•</span>
                      <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                        {item.stockInfo.type}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Dimensions */}
                {item.success && item.stockInfo && item.stockInfo.dimensions && (
                  <Typography variant="caption" className="text-white/60 mb-2 block">
                    {item.stockInfo.dimensions.width} × {item.stockInfo.dimensions.height}
                  </Typography>
                )}

                {/* Author */}
                {item.success && item.stockInfo && item.stockInfo.author && (
                  <Typography variant="caption" className="text-white/60">
                    by {item.stockInfo.author.name}
                  </Typography>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 ml-4">
                {getStatusIcon()}
                {getStatusBadge()}
              </div>
            </div>

            {/* Error Message */}
            {!item.success && item.error && (
              <Alert className="mt-3 border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200 text-sm">
                  {item.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Price */}
            {item.success && item.stockInfo && (
              <div className="flex items-center justify-between mt-3">
                <Typography variant="body" className="text-white/80">
                  Cost
                </Typography>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <Typography variant="h5" className="text-yellow-400 font-semibold">
                    {item.stockInfo.points} points
                  </Typography>
                </div>
              </div>
            )}

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
