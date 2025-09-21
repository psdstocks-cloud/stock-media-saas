'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins, Plus, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface PointsData {
  currentPoints: number
  totalPurchased: number
  totalUsed: number
}

export function PointsHub() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPointsData()
  }, [])

  const fetchPointsData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/points')
      
      if (response.ok) {
        const data = await response.json()
        setPointsData({
          currentPoints: data.data?.currentPoints || 0,
          totalPurchased: data.data?.totalPurchased || 0,
          totalUsed: data.data?.totalUsed || 0
        })
      } else {
        toast.error('Failed to load points data')
      }
    } catch (error) {
      console.error('Error fetching points:', error)
      toast.error('Failed to load points data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyPoints = () => {
    router.push('/pricing')
  }

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-white">
            <Coins className="h-5 w-5 mr-2" />
            Your Points
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Skeleton className="h-12 w-24 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  const currentPoints = pointsData?.currentPoints || 0

  return (
    <Card className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 backdrop-blur-sm border-white/30 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-white">
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <Coins className="h-5 w-5 text-white" />
          </div>
          Your Points
        </CardTitle>
        <CardDescription className="text-white/70">
          Available for downloads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Display */}
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            {currentPoints.toLocaleString()}
          </div>
          <Typography variant="body" className="text-white/80 font-medium">
            Available Points
          </Typography>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-lg font-semibold text-white">
              +{pointsData?.totalPurchased?.toLocaleString() || 0}
            </div>
            <Typography variant="caption" className="text-white/60">
              Purchased
            </Typography>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-lg font-semibold text-white">
              -{pointsData?.totalUsed?.toLocaleString() || 0}
            </div>
            <Typography variant="caption" className="text-white/60">
              Used
            </Typography>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleBuyPoints}
          className="w-full bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white font-semibold py-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buy More Points
        </Button>

        {/* Quick Info */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center text-white/80 text-sm">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            <span>All downloads cost 10 points</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
