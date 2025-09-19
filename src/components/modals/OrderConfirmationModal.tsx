'use client'

import React, { useState, useEffect } from 'react'
import { X, Download, AlertCircle, CheckCircle, Clock, User, Star, Tag, Loader2 } from 'lucide-react'
import { Button, Card, CardContent, Typography, Badge, Separator, Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, Skeleton } from '@/components/ui'
import { useOrderModal, useUserPoints, usePurchaseActions } from '@/stores/orderStore'
import { cn } from '@/lib/utils'

interface StockInfo {
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
  duration?: number
  author: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  createdAt: string
  rating?: number
  downloadCount?: number
  isAvailable: boolean
  downloadUrl?: string
}

export const OrderConfirmationModal: React.FC = () => {
  const { 
    isConfirmationModalOpen, 
    selectedItemForPurchase, 
    closeConfirmationModal 
  } = useOrderModal()
  
  const { userPoints } = useUserPoints()
  const { confirmPurchase, isProcessingPurchase } = usePurchaseActions()

  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch stock info when modal opens
  useEffect(() => {
    if (isConfirmationModalOpen && selectedItemForPurchase) {
      fetchStockInfo(selectedItemForPurchase.id)
    }
  }, [isConfirmationModalOpen, selectedItemForPurchase])

  const fetchStockInfo = async (mediaId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/stock-info?id=${mediaId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock info: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStockInfo(data.stockInfo)
    } catch (err) {
      console.error('Error fetching stock info:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stock information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!stockInfo) return
    
    try {
      await confirmPurchase(stockInfo)
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  const canAfford = stockInfo ? userPoints >= stockInfo.points : false
  const pointsAfterPurchase = stockInfo ? userPoints - stockInfo.points : 0

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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Modal isOpen={isConfirmationModalOpen} onClose={closeConfirmationModal} className="max-w-2xl">
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
              onClick={closeConfirmationModal}
              className="h-8 w-8 p-0"
              disabled={isProcessingPurchase}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </ModalHeader>

        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <div className="relative">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <Typography variant="body-sm" className="text-red-600 font-medium">
                  Error loading asset information
                </Typography>
                <Typography variant="caption" className="text-red-500">
                  {error}
                </Typography>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && stockInfo && (
            <>
              {/* Media Preview */}
              <div className="relative">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={stockInfo.thumbnailUrl}
                    alt={stockInfo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-3 left-3 flex space-x-2">
                  <Badge className={cn("text-white border-0", getTypeColor(stockInfo.type))}>
                    {getTypeIcon(stockInfo.type)} {stockInfo.type}
                  </Badge>
                  {stockInfo.license === 'free' && (
                    <Badge variant="secondary" className="text-white border-0 bg-green-600">
                      Free
                    </Badge>
                  )}
                  {!stockInfo.isAvailable && (
                    <Badge variant="destructive" className="text-white border-0">
                      Unavailable
                    </Badge>
                  )}
                </div>
                
                {/* Duration for videos/audio */}
                {stockInfo.duration && (
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(stockInfo.duration)}
                  </div>
                )}
              </div>

              {/* Media Details */}
              <div className="space-y-4">
                <div>
                  <Typography variant="h3" className="mb-2">
                    {stockInfo.title}
                  </Typography>
                  {stockInfo.description && (
                    <Typography variant="body" color="muted" className="mb-3">
                      {stockInfo.description}
                    </Typography>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {stockInfo.author.avatar ? (
                      <img
                        src={stockInfo.author.avatar}
                        alt={stockInfo.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Typography variant="body-sm" className="font-medium">
                      {stockInfo.author.name}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {formatDate(stockInfo.createdAt)}
                    </Typography>
                  </div>
                </div>

                {/* Media Stats */}
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  {stockInfo.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{stockInfo.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {stockInfo.downloadCount && (
                    <div className="flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>{stockInfo.downloadCount.toLocaleString()} downloads</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(stockInfo.createdAt)}</span>
                  </div>
                </div>

                {/* Tags */}
                {stockInfo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {stockInfo.tags.map((tag) => (
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
                    <Typography variant="body">{formatFileSize(stockInfo.size)}</Typography>
                  </div>
                  {stockInfo.dimensions && (
                    <div>
                      <Typography variant="body-sm" color="muted">Dimensions</Typography>
                      <Typography variant="body">
                        {stockInfo.dimensions.width} × {stockInfo.dimensions.height}
                      </Typography>
                    </div>
                  )}
                  <div>
                    <Typography variant="body-sm" color="muted">License</Typography>
                    <Typography variant="body" className="capitalize">
                      {stockInfo.license.replace('-', ' ')}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body-sm" color="muted">Category</Typography>
                    <Typography variant="body" className="capitalize">
                      {stockInfo.category}
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
                      {stockInfo.points} points
                    </Typography>
                    {stockInfo.price > 0 && (
                      <Typography variant="body-sm" color="muted">
                        (${stockInfo.price})
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
                      Insufficient points. You need {stockInfo.points - userPoints} more points to make this purchase.
                    </Typography>
                  </div>
                )}

                {!stockInfo.isAvailable && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <Typography variant="body-sm" className="text-yellow-600">
                      This asset is currently unavailable for purchase.
                    </Typography>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeConfirmationModal}
                  className="flex-1"
                  disabled={isProcessingPurchase}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!canAfford || !stockInfo.isAvailable || isProcessingPurchase}
                  className="flex-1"
                >
                  {isProcessingPurchase ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Confirm & Spend {stockInfo.points} Points
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}

export default OrderConfirmationModal
