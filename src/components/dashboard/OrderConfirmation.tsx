'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Coins, Download, ExternalLink, AlertCircle, CheckCircle, Clock, X } from 'lucide-react'
import { useOrderStore, PreOrderItem, ConfirmedOrder } from '@/stores/orderStore'
import { toast } from 'react-hot-toast'

interface OrderConfirmationProps {
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function OrderConfirmation({ onConfirm, onCancel, isLoading = false }: OrderConfirmationProps) {
  const { 
    preOrderItems, 
    userPoints, 
    getTotalPoints, 
    getSuccessfulItems, 
    getFailedItems,
    canPlaceOrder,
    removePreOrderItem 
  } = useOrderStore()

  const totalPoints = getTotalPoints()
  const successfulItems = getSuccessfulItems()
  const failedItems = getFailedItems()
  const canPlace = canPlaceOrder()

  const handleRemoveItem = (index: number) => {
    removePreOrderItem(index)
    toast.success('Item removed from order')
  }

  const getStatusBadge = (item: PreOrderItem) => {
    if (item.success) {
      return <Badge variant="success" className="bg-green-100 text-green-800">Ready</Badge>
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Failed</Badge>
    }
  }

  const getStatusIcon = (item: PreOrderItem) => {
    if (item.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else {
      return <X className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Typography variant="h3" className="text-white mb-2">
          Order Confirmation
        </Typography>
        <Typography variant="body" className="text-white/80">
          Review your items before placing the order
        </Typography>
      </div>

      {/* Order Summary */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Order Summary</span>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400">{totalPoints.toLocaleString()} points</span>
            </div>
          </CardTitle>
          <CardDescription className="text-white/70">
            {successfulItems.length} item{successfulItems.length !== 1 ? 's' : ''} ready to order
            {failedItems.length > 0 && ` • ${failedItems.length} failed`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Balance */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <Typography variant="body" className="text-white">
              Your Balance
            </Typography>
            <Typography variant="h4" className="text-white font-semibold">
              {userPoints.toLocaleString()} points
            </Typography>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Typography variant="body" className="text-white/80">
                Total Cost
              </Typography>
              <Typography variant="h4" className="text-white font-semibold">
                {totalPoints.toLocaleString()} points
              </Typography>
            </div>
            <div className="flex items-center justify-between">
              <Typography variant="body" className="text-white/80">
                After Purchase
              </Typography>
              <Typography variant="h4" className="text-white font-semibold">
                {(userPoints - totalPoints).toLocaleString()} points
              </Typography>
            </div>
          </div>

          {/* Insufficient Points Warning */}
          {!canPlace && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                Insufficient points. You need {totalPoints.toLocaleString()} points but only have {userPoints.toLocaleString()}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-4">
        <Typography variant="h4" className="text-white">
          Items ({preOrderItems.length})
        </Typography>
        
        <div className="space-y-3">
          {preOrderItems.map((item, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {item.success && item.stockInfo ? (
                      <img
                        src={item.stockInfo.thumbnailUrl}
                        alt={item.stockInfo.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
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
                        <Typography variant="h5" className="text-white truncate">
                          {item.success && item.stockInfo ? item.stockInfo.title : 'Unknown Title'}
                        </Typography>
                        <Typography variant="caption" className="text-white/60">
                          {item.success && item.parsedData ? item.parsedData.source : 'Unknown Source'}
                        </Typography>
                        {item.success && item.stockInfo && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.stockInfo.type}
                            </Badge>
                            <Typography variant="caption" className="text-white/60">
                              {item.stockInfo.dimensions?.width} × {item.stockInfo.dimensions?.height}
                            </Typography>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(item)}
                        {getStatusBadge(item)}
                      </div>
                    </div>

                    {/* Error Message */}
                    {!item.success && item.error && (
                      <Alert className="mt-2 border-red-500/50 bg-red-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-200 text-sm">
                          {item.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Price */}
                    {item.success && item.stockInfo && (
                      <div className="flex items-center justify-between mt-2">
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
                      onClick={() => handleRemoveItem(index)}
                      className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-8 py-3 border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!canPlace || isLoading}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
        >
          {isLoading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Confirm & Place Order
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <Typography variant="caption" className="text-white/60">
          By confirming this order, you agree to our terms of service and understand that points will be deducted immediately.
        </Typography>
      </div>
    </div>
  )
}
