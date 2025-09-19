'use client'

import React, { useState } from 'react'
import { Heart, Download, Eye, Clock, User, Star, MoreVertical, ShoppingCart } from 'lucide-react'
import { Button, Card, CardContent, Typography, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useOrderStore } from '@/stores/orderStore'

export interface MediaItem {
  id: string
  title: string
  description?: string
  thumbnailUrl: string
  previewUrl?: string
  type: 'photo' | 'video' | 'audio' | 'vector' | 'illustration'
  category: string
  license: string
  price: number
  points: number
  size: string
  dimensions?: {
    width: number
    height: number
  }
  duration?: number // in seconds
  author: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  createdAt: string
  isFavorite?: boolean
  isDownloaded?: boolean
  rating?: number
  downloadCount?: number
}

interface MediaCardProps {
  media: MediaItem
  onDownload?: (media: MediaItem) => void
  onFavorite?: (media: MediaItem) => void
  onPreview?: (media: MediaItem) => void
  onAuthorClick?: (authorId: string) => void
  className?: string
  showActions?: boolean
  showPurchaseButton?: boolean
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onDownload,
  onFavorite,
  onPreview,
  onAuthorClick,
  className,
  showActions = true,
  showPurchaseButton = true
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { openConfirmationModal } = useOrderStore()

  const handleDownload = async () => {
    if (!onDownload) return
    
    setIsLoading(true)
    try {
      await onDownload(media)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(media)
    }
  }

  const handlePreview = () => {
    if (onPreview) {
      onPreview(media)
    }
  }

  const handlePurchase = () => {
    openConfirmationModal(media)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥'
      case 'audio':
        return '🎵'
      case 'vector':
        return '📐'
      case 'illustration':
        return '🎨'
      default:
        return '📷'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-500'
      case 'audio':
        return 'bg-purple-500'
      case 'vector':
        return 'bg-blue-500'
      case 'illustration':
        return 'bg-pink-500'
      default:
        return 'bg-green-500'
    }
  }

  const formatFileSize = (size: string) => {
    return size
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-200 overflow-hidden", className)}>
      <div className="relative aspect-square overflow-hidden">
        {imageError ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Typography variant="body-sm" color="muted">
              Image unavailable
            </Typography>
          </div>
        ) : (
          <img
            src={media.thumbnailUrl}
            alt={media.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
          <div className="absolute top-2 left-2 flex space-x-1">
            <Badge className={cn("text-white border-0", getTypeColor(media.type))}>
              {getTypeIcon(media.type)} {media.type}
            </Badge>
            {media.license === 'free' && (
              <Badge variant="secondary" className="text-white border-0 bg-green-600">
                Free
              </Badge>
            )}
          </div>
          
          <div className="absolute top-2 right-2 flex space-x-1">
            {media.isFavorite && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleFavorite}
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {showActions && (
            <div className="absolute bottom-2 left-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                className="flex-1"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              {showPurchaseButton ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handlePurchase}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Get
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isLoading ? 'Downloading...' : 'Download'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Duration for videos/audio */}
        {media.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(media.duration)}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and description */}
        <div>
          <Typography variant="h6" className="line-clamp-2 mb-1">
            {media.title}
          </Typography>
          {media.description && (
            <Typography variant="body-sm" color="muted" className="line-clamp-2">
              {media.description}
            </Typography>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {media.author.avatar ? (
              <img
                src={media.author.avatar}
                alt={media.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <Typography
            variant="body-sm"
            className="hover:text-primary cursor-pointer"
            onClick={() => onAuthorClick?.(media.author.id)}
          >
            {media.author.name}
          </Typography>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-3">
            {media.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{media.rating.toFixed(1)}</span>
              </div>
            )}
            {media.downloadCount && (
              <div className="flex items-center space-x-1">
                <Download className="h-3 w-3" />
                <span>{media.downloadCount}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(media.createdAt)}</span>
          </div>
        </div>

        {/* Price and points */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Typography variant="h6" className="text-primary">
              {media.points} pts
            </Typography>
            {media.price > 0 && (
              <Typography variant="body-sm" color="muted">
                (${media.price})
              </Typography>
            )}
          </div>
          <Typography variant="body-sm" color="muted">
            {formatFileSize(media.size)}
          </Typography>
        </div>

        {/* Tags */}
        {media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {media.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {media.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{media.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MediaCard
