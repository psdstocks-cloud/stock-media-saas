'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  History,
  Plus
} from 'lucide-react'

interface PointsData {
  success: boolean
  summary: {
    currentPoints: number
    totalPurchased: number
    totalUsed: number
    lastRollover: string | null
  }
  balance: any
  history: any[]
}

export default function PointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPointsData()
  }, [])

  const loadPointsData = async () => {
    try {
      const response = await fetch('/api/points', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPointsData(data)
        }
      }
    } catch (error) {
      console.error('Failed to load points:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPoints = pointsData?.summary?.currentPoints || 0
  const totalPurchased = pointsData?.summary?.totalPurchased || 0
  const totalUsed = pointsData?.summary?.totalUsed || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Points & Billing</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your points, view usage history, and billing information.
        </p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <Coins className="h-4 w-4 mr-2" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentPoints}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available points</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalPurchased}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lifetime earned</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalUsed}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lifetime spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Buy More Points
          </Button>
          <Button variant="outline" className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
          <Button variant="outline" className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <History className="h-4 w-4 mr-2" />
            View Transaction History
          </Button>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {pointsData?.history && pointsData.history.length > 0 ? (
            <div className="space-y-3">
              {pointsData.history.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.description || item.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={item.points > 0 ? 'default' : 'secondary'} className="dark:bg-gray-700">
                    {item.points > 0 ? '+' : ''}{item.points}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No transaction history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}