'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Typography } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Calculator, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingTier {
  min: number
  max: number
  pricePerPoint: number
  color: string
  label: string
  popular?: boolean
  savings?: number
  icon: React.ComponentType<{ className?: string }>
}

interface ValidityOption {
  days: number
  multiplier: number
  label: string
  popular?: boolean
  description: string
}

const pricingTiers: PricingTier[] = [
  {
    min: 1,
    max: 10,
    pricePerPoint: 0.50,
    color: 'from-red-500 to-red-600',
    label: 'Starter',
    icon: Zap,
    savings: 0
  },
  {
    min: 11,
    max: 50,
    pricePerPoint: 0.40,
    color: 'from-orange-500 to-orange-600',
    label: 'Growth',
    icon: TrendingUp,
    savings: 20
  },
  {
    min: 51,
    max: 100,
    pricePerPoint: 0.30,
    color: 'from-yellow-500 to-yellow-600',
    label: 'Popular',
    popular: true,
    icon: Star,
    savings: 40
  },
  {
    min: 101,
    max: 170,
    pricePerPoint: 0.294,
    color: 'from-green-500 to-green-600',
    label: 'Business',
    icon: Users,
    savings: 41.2
  },
  {
    min: 171,
    max: 400,
    pricePerPoint: 0.26,
    color: 'from-blue-500 to-blue-600',
    label: 'Pro',
    icon: Crown,
    savings: 48
  },
  {
    min: 401,
    max: 500,
    pricePerPoint: 0.24,
    color: 'from-purple-500 to-purple-600',
    label: 'Enterprise',
    icon: Crown,
    savings: 52
  }
]

const validityOptions: ValidityOption[] = [
  {
    days: 30,
    multiplier: 1.0,
    label: '30 Days',
    popular: true,
    description: 'Standard validity'
  },
  {
    days: 60,
    multiplier: 1.15,
    label: '60 Days',
    description: 'Extended validity (+15%)'
  },
  {
    days: 90,
    multiplier: 1.25,
    label: '90 Days',
    description: 'Long-term option (+25%)'
  },
  {
    days: 365,
    multiplier: 1.40,
    label: '1 Year',
    description: 'Annual commitment (+40%)'
  }
]

interface DynamicPricingSliderProps {
  onPurchase?: (points: number, validity: number, totalPrice: number) => void
  className?: string
}

export const DynamicPricingSlider: React.FC<DynamicPricingSliderProps> = ({
  onPurchase,
  className
}) => {
  const [points, setPoints] = useState(100)
  const [validity, setValidity] = useState(30)
  const [isEnterprise, setIsEnterprise] = useState(false)

  // Calculate current tier and pricing
  const currentTier = pricingTiers.find(tier => points >= tier.min && points <= tier.max)
  const validityOption = validityOptions.find(option => option.days === validity)
  
  const basePrice = currentTier ? points * currentTier.pricePerPoint : 0
  const validityMultiplier = validityOption?.multiplier || 1.0
  const totalPrice = basePrice * validityMultiplier
  const savings = currentTier ? (basePrice * (currentTier.savings || 0) / 100) : 0

  // Handle points change
  const handlePointsChange = useCallback((newPoints: number) => {
    if (newPoints < 1) {
      setPoints(1)
    } else if (newPoints > 500) {
      setIsEnterprise(true)
      setPoints(500)
    } else {
      setIsEnterprise(false)
      setPoints(newPoints)
    }
  }, [])

  // Handle slider change
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPoints = parseInt(event.target.value)
    handlePointsChange(newPoints)
  }

  // Handle manual input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPoints = parseInt(event.target.value) || 0
    handlePointsChange(newPoints)
  }

  // Handle purchase
  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(points, validity, totalPrice)
    }
  }

  // Get tier color for slider
  const getSliderColor = () => {
    if (!currentTier) return 'bg-gray-300'
    return `bg-gradient-to-r ${currentTier.color}`
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
              <Calculator className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
            Dynamic Point Pricing
          </CardTitle>
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-lg">
            Choose your points and validity period. The more you buy, the less you pay per point!
          </Typography>
        </CardHeader>

        <CardContent className="space-y-8 px-8">
          {/* Points Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <Label htmlFor="points-slider" className="text-xl font-semibold text-[hsl(var(--foreground))]">
                How many points do you need?
              </Label>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mt-2">
                Drag the slider or enter a number directly
              </Typography>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  id="points-slider"
                  type="range"
                  min="1"
                  max="500"
                  value={points}
                  onChange={handleSliderChange}
                  className={cn(
                    "w-full h-3 rounded-lg appearance-none cursor-pointer",
                    "bg-gray-200 dark:bg-gray-700",
                    "focus:outline-none focus:ring-4 focus:ring-orange-500/20"
                  )}
                  style={{
                    background: `linear-gradient(to right, ${getSliderColor()} 0%, ${getSliderColor()} ${(points / 500) * 100}%, #e5e7eb ${(points / 500) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>1 point</span>
                  <span>500+ points</span>
                </div>
              </div>

              {/* Manual Input */}
              <div className="flex items-center justify-center space-x-4">
                <Label htmlFor="points-input" className="text-sm font-medium">
                  Points:
                </Label>
                <Input
                  id="points-input"
                  type="number"
                  min="1"
                  max="500"
                  value={points}
                  onChange={handleInputChange}
                  className="w-24 text-center font-semibold"
                />
                <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                  points
                </Typography>
              </div>
            </div>

            {/* Current Tier Display */}
            {currentTier && (
              <div className="text-center">
                <Badge className={cn(
                  "px-4 py-2 text-sm font-bold",
                  currentTier.popular && "animate-pulse"
                )}>
                  {currentTier.popular && "⭐ "}
                  {currentTier.label} Tier
                  {currentTier.savings > 0 && ` (${currentTier.savings}% savings)`}
                </Badge>
              </div>
            )}
          </div>

          {/* Validity Selection */}
          <div className="space-y-4">
            <div className="text-center">
              <Label className="text-xl font-semibold text-[hsl(var(--foreground))]">
                How long should your points be valid?
              </Label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {validityOptions.map((option) => (
                <button
                  key={option.days}
                  onClick={() => setValidity(option.days)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 text-center",
                    "hover:scale-105 hover:shadow-lg",
                    validity === option.days
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                  )}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <Typography variant="body-sm" className="font-semibold">
                    {option.label}
                  </Typography>
                  {option.popular && (
                    <Badge className="mt-1 text-xs">Popular</Badge>
                  )}
                  <Typography variant="body-xs" className="text-[hsl(var(--muted-foreground))] mt-1">
                    {option.description}
                  </Typography>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Display */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Typography variant="h3" className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  ${totalPrice.toFixed(2)}
                </Typography>
                <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-lg">
                  total
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                    Price per point
                  </Typography>
                  <Typography variant="body" className="font-semibold">
                    ${currentTier?.pricePerPoint.toFixed(3) || '0.000'}
                  </Typography>
                </div>
                <div className="text-center">
                  <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                    Validity period
                  </Typography>
                  <Typography variant="body" className="font-semibold">
                    {validity} days
                  </Typography>
                </div>
                <div className="text-center">
                  <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                    You save
                  </Typography>
                  <Typography variant="body" className="font-semibold text-green-600 dark:text-green-400">
                    ${savings.toFixed(2)}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Contact */}
          {isEnterprise && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 text-center">
              <Crown className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <Typography variant="h4" className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
                Need 500+ Points?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mb-4">
                Contact our sales team for custom enterprise pricing and dedicated support.
              </Typography>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                Contact Sales
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Purchase Button */}
          {!isEnterprise && (
            <div className="text-center">
              <Button
                onClick={handlePurchase}
                className="w-full md:w-auto px-8 py-4 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Zap className="h-5 w-5 mr-2" />
                Purchase {points} Points
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicPricingSlider
