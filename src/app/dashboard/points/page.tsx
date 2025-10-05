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

export default function PointsPage() {
  const [pointsData, setPointsData] = useState(null)
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
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPoints = pointsData?.summary?.currentPoints || 0
  const totalEarned = pointsData?.summary?.totalEarned || 0
  const totalSpent = pointsData?.summary?.totalSpent || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Points & Billing</h1>
        <p className="text-gray-600 mt-2">
          Manage your points, view usage history, and billing information.
        </p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Coins className="h-4 w-4 mr-2" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{currentPoints}</div>
            <p className="text-xs text-gray-500 mt-1">Available points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalEarned}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalSpent}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Buy More Points
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <History className="h-4 w-4 mr-2" />
            View Transaction History
          </Button>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {pointsData?.history?.length > 0 ? (
            <div className="space-y-3">
              {pointsData.history.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.description || item.type}</p>
                    <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={item.points > 0 ? 'default' : 'secondary'}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transaction history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

