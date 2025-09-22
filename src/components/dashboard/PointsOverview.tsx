'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'
import useUserStore from '@/stores/userStore'

interface PointsOverviewProps {
  className?: string
}

export default function PointsOverview({ className }: PointsOverviewProps) {
  const { points, isLoading } = useUserStore()

  return (
    <Card className={`bg-indigo-700 text-white shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-normal tracking-tight flex items-center">
          <Coins className="h-5 w-5 mr-2" />
          Your Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-orange-400">
          {isLoading ? '...' : points === null ? '...' : points}
        </div>
        <p className="text-sm text-indigo-200 mt-1">Points Available</p>
      </CardContent>
    </Card>
  )
}