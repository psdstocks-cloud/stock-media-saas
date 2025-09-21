'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Coins, CheckCircle, X, Loader2, CreditCard } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PointPack {
  id: string
  name: string
  points: number
  price: number
  description?: string
  features?: string[]
}

interface VirtualPurchaseModalProps {
  pointPack: PointPack
  onClose: () => void
  onSuccess: () => void
}

export default function VirtualPurchaseModal({ pointPack, onClose, onSuccess }: VirtualPurchaseModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/virtual-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pointPackageId: pointPack.id
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message, {
          duration: 4000,
          icon: '🎉'
        })
        onSuccess()
      } else {
        setError(data.error || 'Purchase failed')
        toast.error(data.error || 'Purchase failed', {
          duration: 5000,
          icon: '❌'
        })
      }
    } catch (error) {
      console.error('Purchase error:', error)
      const errorMessage = 'Failed to process purchase. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            Virtual Purchase
          </DialogTitle>
          <DialogDescription>
            This is a virtual purchase for testing purposes. Points will be added to your account immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Point Pack Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="h5" className="font-semibold">
                {pointPack.name}
              </Typography>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Coins className="h-3 w-3 mr-1" />
                {pointPack.points} points
              </Badge>
            </div>
            
            {pointPack.description && (
              <Typography variant="body" className="text-gray-600 mb-3">
                {pointPack.description}
              </Typography>
            )}

            <div className="flex items-center justify-between">
              <Typography variant="body" className="text-gray-500">
                Virtual Price
              </Typography>
              <Typography variant="h5" className="font-bold text-green-600">
                FREE
              </Typography>
            </div>
          </div>

          {/* Features */}
          {pointPack.features && pointPack.features.length > 0 && (
            <div>
              <Typography variant="body" className="font-medium mb-2">
                What's included:
              </Typography>
              <div className="space-y-1">
                {pointPack.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <Typography variant="body-sm" className="text-gray-600">
                      {feature}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Add Points
                </>
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <Typography variant="caption" className="text-gray-500 text-center block">
            This is a virtual purchase for development/testing purposes only.
          </Typography>
        </div>
      </DialogContent>
    </Dialog>
  )
}
