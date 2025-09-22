'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'
import AnimatedPoints from './AnimatedPoints'

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
        <AnimatedPoints points={points} />
      </CardContent>
    </Card>
  )
}

export default SimplePointsOverview
