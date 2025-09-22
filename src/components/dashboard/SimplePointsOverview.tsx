'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'

interface SimplePointsOverviewProps {
  points: number
  className?: string
}

const SimplePointsOverview: React.FC<SimplePointsOverviewProps> = ({ points, className }) => {
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
          {points.toLocaleString()}
        </div>
        <p className="text-indigo-200 mt-1">Points</p>
      </CardContent>
    </Card>
  )
}

export default SimplePointsOverview
