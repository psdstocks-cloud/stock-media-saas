'use client'

import React, { useState } from 'react'
import { X, Download, CreditCard, AlertCircle, CheckCircle, Clock, User, Star, Tag } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Typography, Badge, Separator, Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/components/ui'
import { MediaItem } from '@/components/search/MediaCard'
import { cn } from '@/lib/utils'

interface PurchaseConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (media: MediaItem) => Promise<void>
  media: MediaItem | null
  userPoints: number
  isLoading?: boolean
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  media,
  userPoints,
  isLoading = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!media) return null

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm(media)
    } finally {
      setIsProcessing(false)
    }
  }

  const canAfford = userPoints >= media.points
  const pointsAfterPurchase = userPoints - media.points

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <ModalContent className="p-0">
        <ModalHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <ModalTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-primary" />
                <span>Confirm Purchase</span>
              </ModalTitle>
              <ModalDescription>
                Review your selection and confirm the purchase
              </ModalDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </ModalHeader>

        <div className="space-y-6">
          {/* Media Preview */}
          <div className="relative">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={media.thumbnailUrl}
                alt={media.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-3 left-3 flex space-x-2">
              <Badge className={cn("text-white border-0", getTypeColor(media.type))}>
                {getTypeIcon(media.type)} {media.type}
              </Badge>
              {media.license === 'free' && (
                <Badge variant="secondary" className="text-white border-0 bg-green-600">
                  Free
                </Badge>
              )}
            </div>
          </div>

          {/* Media Details */}
          <div className="space-y-4">
            <div>
              <Typography variant="h3" className="mb-2">
                {media.title}
              </Typography>
              {media.description && (
                <Typography variant="body" color="muted" className="mb-3">
                  {media.description}
                </Typography>
              )}
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {media.author.avatar ? (
                  <img
                    src={media.author.avatar}
                    alt={media.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <Typography variant="body-sm" className="font-medium">
                  {media.author.name}
                </Typography>
                <Typography variant="caption" color="muted">
                  {formatDate(media.createdAt)}
                </Typography>
              </div>
            </div>

            {/* Media Stats */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              {media.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{media.rating.toFixed(1)}</span>
                </div>
              )}
              {media.downloadCount && (
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{media.downloadCount.toLocaleString()} downloads</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(media.createdAt)}</span>
              </div>
            </div>

            {/* Tags */}
            {media.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {media.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Purchase Details */}
          <div className="space-y-4">
            <Typography variant="h4">Purchase Details</Typography>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="body-sm" color="muted">File Size</Typography>
                <Typography variant="body">{formatFileSize(media.size)}</Typography>
              </div>
              {media.dimensions && (
                <div>
                  <Typography variant="body-sm" color="muted">Dimensions</Typography>
                  <Typography variant="body">
                    {media.dimensions.width} × {media.dimensions.height}
                  </Typography>
                </div>
              )}
              <div>
                <Typography variant="body-sm" color="muted">License</Typography>
                <Typography variant="body" className="capitalize">
                  {media.license.replace('-', ' ')}
                </Typography>
              </div>
              <div>
                <Typography variant="body-sm" color="muted">Category</Typography>
                <Typography variant="body" className="capitalize">
                  {media.category}
                </Typography>
              </div>
            </div>
          </div>

          <Separator />

          {/* Points and Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="h4">Cost</Typography>
              <div className="text-right">
                <Typography variant="h3" className="text-primary">
                  {media.points} points
                </Typography>
                {media.price > 0 && (
                  <Typography variant="body-sm" color="muted">
                    (${media.price})
                  </Typography>
                )}
              </div>
            </div>

            {/* User Points Balance */}
            <Card className={cn(
              "border-2",
              canAfford ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {canAfford ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <Typography variant="body-sm" className="font-medium">
                        Your Points Balance
                      </Typography>
                      <Typography variant="h4" className={cn(
                        canAfford ? "text-green-600" : "text-red-600"
                      )}>
                        {userPoints.toLocaleString()} points
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body-sm" color="muted">
                      After Purchase
                    </Typography>
                    <Typography variant="h4" className={cn(
                      canAfford ? "text-green-600" : "text-red-600"
                    )}>
                      {pointsAfterPurchase.toLocaleString()}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!canAfford && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <Typography variant="body-sm" className="text-red-600">
                  Insufficient points. You need {media.points - userPoints} more points to make this purchase.
                </Typography>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canAfford || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default PurchaseConfirmationModal
