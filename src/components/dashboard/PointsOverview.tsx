'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Plus,
  Minus,
  History,
  Calendar,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PointsData {
  currentPoints: number
  totalPurchased: number
  totalUsed: number
  monthlyAllocation: number
  rolloverAmount: number
  rolloverDate: string
  subscriptionPlan: {
    name: string
    monthlyPoints: number
    rolloverPercentage: number
  }
}

interface PointsHistory {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
  orderId?: string
}

interface PointsOverviewProps {
  className?: string
}

export function PointsOverview({ className }: PointsOverviewProps) {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const fetchPointsData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [pointsResponse, historyResponse] = await Promise.all([
        fetch('/api/points'),
        fetch('/api/points/history?limit=10')
      ])

      if (pointsResponse.ok) {
        const pointsResult = await pointsResponse.json()
        setPointsData(pointsResult.data || pointsResult)
      } else {
        setError('Failed to fetch points data')
      }

      if (historyResponse.ok) {
        const historyResult = await historyResponse.json()
        setPointsHistory(historyResult.history || historyResult.data || [])
      }
    } catch (error) {
      setError('An error occurred while fetching points data')
      console.error('Points fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPointsData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE_PACK':
      case 'SUBSCRIPTION':
        return <Plus className="h-4 w-4 text-green-500" />
      case 'ORDER':
      case 'DOWNLOAD':
        return <Minus className="h-4 w-4 text-red-500" />
      case 'ROLLOVER':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      default:
        return <Coins className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-green-500'
    if (amount < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="h-5 w-5 mr-2" />
            Points Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={fetchPointsData}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Coins className="h-5 w-5 mr-2" />
              Points Overview
            </CardTitle>
            <CardDescription>
              Your points balance and usage information
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPointsData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : pointsData ? (
          <div className="space-y-6">
            {/* Main Balance */}
            <div className="text-center">
              <Typography variant="h2" className="font-bold text-3xl">
                {pointsData.currentPoints.toLocaleString()}
              </Typography>
              <Typography variant="body" color="muted">
                Available Points
              </Typography>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Typography variant="h4" className="font-semibold text-green-600">
                  {pointsData.totalPurchased.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="muted">
                  Total Purchased
                </Typography>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Typography variant="h4" className="font-semibold text-red-600">
                  {pointsData.totalUsed.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="muted">
                  Total Used
                </Typography>
              </div>
            </div>

            {/* Subscription Info */}
            {pointsData.subscriptionPlan && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="body" className="font-medium">
                    {pointsData.subscriptionPlan.name} Plan
                  </Typography>
                  <Badge variant="secondary">
                    {pointsData.subscriptionPlan.monthlyPoints} pts/month
                  </Badge>
                </div>
                <Typography variant="caption" color="muted">
                  {pointsData.subscriptionPlan.rolloverPercentage}% rollover allowed
                </Typography>
              </div>
            )}

            {/* Rollover Info */}
            {pointsData.rolloverAmount > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <Typography variant="body" className="font-medium">
                    Rollover Available
                  </Typography>
                </div>
                <Typography variant="h4" className="font-semibold text-blue-600">
                  {pointsData.rolloverAmount.toLocaleString()} points
                </Typography>
                <Typography variant="caption" color="muted">
                  Next rollover: {formatDate(pointsData.rolloverDate)}
                </Typography>
              </div>
            )}

            {/* Recent History */}
            {showHistory && (
              <div className="space-y-3">
                <Typography variant="body" className="font-medium">
                  Recent Activity
                </Typography>
                {pointsHistory.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pointsHistory.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <Typography variant="body" className="font-medium">
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="muted">
                              {formatDate(transaction.createdAt)}
                            </Typography>
                          </div>
                        </div>
                        <Typography 
                          variant="body" 
                          className={`font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}
                        >
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Typography variant="body" color="muted">
                      No recent activity
                    </Typography>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="h3" className="mb-2">
              No Points Data
            </Typography>
            <Typography variant="body" color="muted">
              Unable to load your points information
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PointsOverview
