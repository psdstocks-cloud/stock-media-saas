'use client'

import React from 'react'
import { Download, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, FileText, Image, Video, Music, Archive } from 'lucide-react'
import { Button, Card, CardContent, Typography, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

interface OrderRowProps {
  order: {
    id: string
    title: string | null
    imageUrl: string | null
    cost: number
    status: string
    downloadUrl: string | null
    fileName: string | null
    fileSize: number | null
    createdAt: Date
    updatedAt: Date
    stockSite: {
      id: string
      name: string
      displayName: string
    }
  }
  onDownload?: (order: OrderRowProps['order']) => void
  onSelect?: (orderId: string, selected: boolean) => void
  isSelected?: boolean
  showSelection?: boolean
  className?: string
}

const STATUS_CONFIG = {
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  },
  PROCESSING: {
    label: 'Processing',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600'
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
  PENDING: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600'
  },
  READY: {
    label: 'Ready',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  }
}

const getFileTypeIcon = (fileName: string | null) => {
  if (!fileName) return FileText
  
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return Image
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return Video
    case 'mp3':
    case 'wav':
    case 'aac':
    case 'flac':
      return Music
    case 'zip':
    case 'rar':
    case '7z':
      return Archive
    default:
      return FileText
  }
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown size'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeDate = (date: Date) => {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInHours < 168) { // 7 days
    const days = Math.floor(diffInHours / 24)
    return `${days}d ago`
  } else {
    return formatDate(date)
  }
}

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  onDownload,
  onSelect,
  isSelected = false,
  showSelection = false,
  className
}) => {
  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.FAILED
  const StatusIcon = statusConfig.icon
  const FileIcon = getFileTypeIcon(order.fileName)
  
  const isDownloadable = order.status === 'COMPLETED' || order.status === 'READY'
  const hasDownloadUrl = order.downloadUrl !== null

  const handleDownload = () => {
    if (onDownload && isDownloadable && hasDownloadUrl) {
      onDownload(order)
    } else if (hasDownloadUrl) {
      // Fallback: open download URL directly
      window.open(order.downloadUrl!, '_blank')
    }
  }

  const handleSelection = () => {
    if (onSelect) {
      onSelect(order.id, !isSelected)
    }
  }

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200",
      isSelected && "ring-2 ring-primary ring-offset-2",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Selection Checkbox */}
          {showSelection && (
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelection}
                className={cn(
                  "h-8 w-8 p-0 rounded-full",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
              <img
                src={order.imageUrl || '/placeholder-image.jpg'}
                alt={order.title || 'Media item'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </div>
          </div>

          {/* Order Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                {/* Title and Source */}
                <div className="flex items-center space-x-2 mb-1">
                  <Typography variant="h4" className="truncate">
                    {order.title || 'Untitled Media'}
                  </Typography>
                  <Badge variant="outline" className="text-xs">
                    {order.stockSite.displayName}
                  </Badge>
                </div>

                {/* File Information */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                  {order.fileName && (
                    <div className="flex items-center space-x-1">
                      <FileIcon className="h-3 w-3" />
                      <span className="truncate max-w-32">{order.fileName}</span>
                    </div>
                  )}
                  {order.fileSize && (
                    <span>{formatFileSize(order.fileSize)}</span>
                  )}
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{order.cost} pts</span>
                  </div>
                </div>

                {/* Date Information */}
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeDate(order.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center space-x-3 ml-4">
                {/* Status Badge */}
                <Badge className={statusConfig.color}>
                  <StatusIcon className={cn("h-3 w-3 mr-1", statusConfig.iconColor)} />
                  {statusConfig.label}
                </Badge>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {isDownloadable && hasDownloadUrl ? (
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  ) : order.status === 'PROCESSING' || order.status === 'PENDING' ? (
                    <Button size="sm" disabled className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Processing...</span>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled className="flex items-center space-x-1">
                      <XCircle className="h-4 w-4" />
                      <span>Unavailable</span>
                    </Button>
                  )}

                  {/* External Link */}
                  {hasDownloadUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(order.downloadUrl!, '_blank')}
                      className="p-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderRow
