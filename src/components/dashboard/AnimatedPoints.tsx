'use client'

import { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'

interface AnimatedPointsProps {
  points: number
  className?: string
}

export default function AnimatedPoints({ points, className }: AnimatedPointsProps) {
  const [displayPoints, setDisplayPoints] = useState(points)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (points !== displayPoints) {
      setIsAnimating(true)
      
      // Animate the number change
      const startPoints = displayPoints
      const endPoints = points
      const difference = endPoints - startPoints
      const duration = 1000 // 1 second
      const steps = 30
      const stepDuration = duration / steps
      const stepSize = difference / steps
      
      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const newPoints = Math.round(startPoints + (stepSize * currentStep))
        setDisplayPoints(newPoints)
        
        if (currentStep >= steps) {
          setDisplayPoints(endPoints)
          clearInterval(interval)
          setIsAnimating(false)
        }
      }, stepDuration)
      
      return () => clearInterval(interval)
    }
  }, [points, displayPoints])

  return (
    <div className={`text-center ${className}`}>
      <Typography 
        variant="h2" 
        className={`font-bold text-3xl transition-all duration-300 ${
          isAnimating ? 'scale-110 text-orange-300' : 'text-orange-400'
        }`}
      >
        {displayPoints.toLocaleString()}
      </Typography>
      <Typography variant="body" className="text-indigo-200 mt-1">
        Points
      </Typography>
    </div>
  )
}
